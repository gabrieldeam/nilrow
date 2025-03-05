package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.*;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    // Diretório base onde as imagens do produto/variações serão salvas
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Caminho default caso o produto/variação não possua imagens
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CatalogRepository catalogRepository;


    /**
     * Cria um produto completo com especificações e variações, incluindo upload de imagens
     * para o produto e para cada variação.
     */
    @Transactional
    public ProductDTO createProduct(ProductDTO dto,
                                    List<MultipartFile> productImages,
                                    Map<Integer, List<MultipartFile>> variationImages) throws IOException {

        Product product = new Product();
        mapDtoToEntity(dto, product);

        // 1) Salvar imagens do produto principal
        List<String> productImagePaths = saveImages(productImages);
        if (productImagePaths.isEmpty()) {
            product.setImages(Collections.singletonList(DEFAULT_IMAGE));
        } else {
            product.setImages(productImagePaths);
        }

        // 2) Especificações Técnicas
        if (dto.getTechnicalSpecifications() != null) {
            List<TechnicalSpecification> specs = dto.getTechnicalSpecifications().stream()
                    .map(specDTO -> {
                        TechnicalSpecification spec = new TechnicalSpecification();
                        spec.setTitle(specDTO.getTitle());
                        spec.setContent(specDTO.getContent());
                        spec.setProduct(product);
                        return spec;
                    })
                    .collect(Collectors.toList());
            product.setTechnicalSpecifications(specs);
        }

        // 3) Variações (com imagens e atributos)
        if (dto.getVariations() != null && !dto.getVariations().isEmpty()) {
            List<ProductVariation> variations = new ArrayList<>();
            for (int i = 0; i < dto.getVariations().size(); i++) {
                ProductVariationDTO varDTO = dto.getVariations().get(i);

                ProductVariation variation = new ProductVariation();
                variation.setPrice(varDTO.getPrice());
                variation.setDiscountPrice(varDTO.getDiscountPrice());
                variation.setStock(varDTO.getStock());
                variation.setActive(varDTO.isActive());
                variation.setProduct(product);

                // Upload de imagens específicas da variação
                List<MultipartFile> varImages = variationImages.get(i);
                List<String> variationImagePaths = saveImages(varImages);

                if (variationImagePaths.isEmpty()) {
                    variation.setImages(Collections.singletonList(DEFAULT_IMAGE));
                } else {
                    variation.setImages(variationImagePaths);
                }

                // Atributos da variação
                if (varDTO.getAttributes() != null) {
                    List<VariationAttribute> attrs = varDTO.getAttributes().stream()
                            .map(attrDTO -> {
                                VariationAttribute attr = new VariationAttribute();
                                attr.setAttributeName(attrDTO.getAttributeName());
                                attr.setAttributeValue(attrDTO.getAttributeValue());
                                attr.setVariation(variation);
                                return attr;
                            })
                            .collect(Collectors.toList());
                    variation.setAttributes(attrs);
                }
                variations.add(variation);
            }
            product.setVariations(variations);
        }

        // 4) Persiste no banco
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    /**
     * Atualiza completamente um produto, suas especificações, variações e imagens.
     * Caso sejam enviadas novas imagens, as antigas são removidas e substituídas.
     */
    @Transactional
    public ProductDTO updateProduct(String id,
                                    ProductDTO dto,
                                    List<MultipartFile> productImages,
                                    Map<Integer, List<MultipartFile>> variationImages) throws IOException {

        // 1) Carrega o produto do banco
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // 2) Atualiza campos básicos (nome, preço, etc.), mas NÃO mexe ainda em variações/imagens
        mapDtoToEntity(dto, product);

        // 3) ATUALIZA IMAGENS DO PRODUTO PRINCIPAL
        updateProductImages(product, dto.getImages(), productImages);

        // 4) ATUALIZA ESPECIFICAÇÕES TÉCNICAS
        updateTechnicalSpecifications(product, dto.getTechnicalSpecifications());

        // 5) ATUALIZA VARIAÇÕES (E SUAS IMAGENS E ATRIBUTOS)
        updateProductVariations(product, dto.getVariations(), variationImages);

        // 6) Persiste e retorna
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Atualiza a lista de imagens do produto principal, mantendo as URLs antigas que o usuário
     * ainda quer, removendo as que saíram do DTO e adicionando novas que vieram em 'productImages'.
     */
    private void updateProductImages(Product product,
                                     List<String> desiredUrls,
                                     List<MultipartFile> productImages) throws IOException {
        List<String> oldUrls = product.getImages() == null
                ? new ArrayList<>()
                : new ArrayList<>(product.getImages());

        final List<String> desired = (desiredUrls == null) ? new ArrayList<>() : desiredUrls;

        // Identifica URLs removidas pelo usuário
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .collect(Collectors.toList());

        // Deleta fisicamente as removidas (exceto DEFAULT_IMAGE)
        removedUrls.forEach(this::deleteImageIfNotDefault);

        // Lista final inicia com as URLs que o usuário deseja manter
        List<String> finalUrls = new ArrayList<>(desired);

        // Faz upload de novas imagens e adiciona
        List<String> newUploads = saveImages(productImages);
        finalUrls.addAll(newUploads);

        if (finalUrls.isEmpty()) {
            finalUrls = Collections.singletonList(DEFAULT_IMAGE);
        }

        product.setImages(finalUrls);
    }

    /**
     * Atualiza as especificações técnicas do produto, preservando as existentes que não foram removidas.
     */
    private void updateTechnicalSpecifications(Product product, List<TechnicalSpecificationDTO> specsDTO) {
        List<TechnicalSpecification> existingSpecs = product.getTechnicalSpecifications();
        if (existingSpecs == null) {
            existingSpecs = new ArrayList<>();
            product.setTechnicalSpecifications(existingSpecs);
        }

        // Mapeia por ID para encontrar specs antigas
        Map<String, TechnicalSpecification> existingMap = existingSpecs.stream()
                .collect(Collectors.toMap(TechnicalSpecification::getId, s -> s));

        Set<String> specsToKeep = new HashSet<>();

        if (specsDTO != null) {
            for (TechnicalSpecificationDTO dto : specsDTO) {
                if (dto.getId() != null && existingMap.containsKey(dto.getId())) {
                    // atualiza existente
                    TechnicalSpecification existing = existingMap.get(dto.getId());
                    existing.setTitle(dto.getTitle());
                    existing.setContent(dto.getContent());
                    specsToKeep.add(dto.getId());
                } else {
                    // nova spec
                    TechnicalSpecification newSpec = new TechnicalSpecification();
                    newSpec.setTitle(dto.getTitle());
                    newSpec.setContent(dto.getContent());
                    newSpec.setProduct(product);
                    existingSpecs.add(newSpec);
                }
            }
        }

        // remove specs que o usuário tirou
        existingSpecs.removeIf(spec ->
                spec.getId() != null && !specsToKeep.contains(spec.getId()));
    }

    /**
     * MÉTODO CRUCIAL: atualiza variações do produto por índice (0, 1, 2...),
     * sem trocar a coleção e sem apagar variações apenas por não ter atributos.
     */
    private void updateProductVariations(
            Product product,
            List<ProductVariationDTO> variationDTOs,
            Map<Integer, List<MultipartFile>> variationImages
    ) throws IOException {

        // 1) Se não houver variações no DTO, remove todas as existentes
        if (variationDTOs == null || variationDTOs.isEmpty()) {
            if (product.getVariations() != null) {
                for (ProductVariation oldVar : product.getVariations()) {
                    deleteImages(oldVar.getImages());
                }
                product.getVariations().clear();
            }
            return;
        }

        // 2) Se a lista de variações estiver nula, inicializa
        if (product.getVariations() == null) {
            product.setVariations(new ArrayList<>());
        }

        // 3) Cria lista final, na mesma ordem do front
        List<ProductVariation> finalVariations = new ArrayList<>();

        for (int i = 0; i < variationDTOs.size(); i++) {
            ProductVariationDTO varDTO = variationDTOs.get(i);

            // Reaproveita variação se existir no índice i, senão cria nova
            ProductVariation variation;
            if (i < product.getVariations().size()) {
                variation = product.getVariations().get(i);
            } else {
                variation = new ProductVariation();
                variation.setProduct(product);
            }

            // Campos básicos
            variation.setPrice(varDTO.getPrice());
            variation.setDiscountPrice(varDTO.getDiscountPrice());
            variation.setStock(varDTO.getStock());
            variation.setActive(varDTO.isActive());

            // Imagens
            List<MultipartFile> newFiles = variationImages.get(i);
            List<String> desiredUrls = varDTO.getImages();
            updateVariationImages(variation, desiredUrls, newFiles);

            // Atributos (se vieram vazios, não removemos a variação)
            if (varDTO.getAttributes() != null) {
                if (variation.getAttributes() == null) {
                    variation.setAttributes(new ArrayList<>());
                } else {
                    variation.getAttributes().clear();
                }
                for (VariationAttributeDTO attrDTO : varDTO.getAttributes()) {
                    VariationAttribute attr = new VariationAttribute();
                    attr.setVariation(variation);
                    attr.setAttributeName(attrDTO.getAttributeName());
                    attr.setAttributeValue(attrDTO.getAttributeValue());
                    variation.getAttributes().add(attr);
                }
            } else {
                // A variação pode ter attributes nulo ou vazio, mas ainda assim manter imagens
                if (variation.getAttributes() != null) {
                    variation.getAttributes().clear();
                }
            }

            // Adiciona à lista final
            finalVariations.add(variation);
        }

        // 4) Se havia mais variações no banco, remove as extras
        if (product.getVariations().size() > variationDTOs.size()) {
            for (int i = variationDTOs.size(); i < product.getVariations().size(); i++) {
                ProductVariation orphanVar = product.getVariations().get(i);
                deleteImages(orphanVar.getImages());
            }
        }

        // 5) Limpamos a lista antiga e adicionamos as novas variações
        product.getVariations().clear();
        product.getVariations().addAll(finalVariations);
    }

    /**
     * Atualiza imagens de uma variação existente, removendo as que não estão mais no DTO
     * e adicionando as que vieram em 'newImages'.
     */
    private void updateVariationImages(ProductVariation variation,
                                       List<String> desiredUrls,
                                       List<MultipartFile> newImages) throws IOException {
        List<String> oldUrls = (variation.getImages() == null)
                ? new ArrayList<>()
                : new ArrayList<>(variation.getImages());

        // se 'desiredUrls' for null, iniciamos vazio
        final List<String> desired = (desiredUrls == null) ? new ArrayList<>() : desiredUrls;

        // Remove as antigas que não foram desejadas
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .collect(Collectors.toList());
        removedUrls.forEach(this::deleteImageIfNotDefault);

        // Começa finalUrls com as URLs que ficaram
        List<String> finalUrls = new ArrayList<>(desired);

        // Upload das novas
        List<String> uploaded = saveImages(newImages);
        finalUrls.addAll(uploaded);

        if (finalUrls.isEmpty()) {
            finalUrls = Collections.singletonList(DEFAULT_IMAGE);
        }

        variation.setImages(finalUrls);
    }

    /** Remove fisicamente uma imagem se não for a DEFAULT_IMAGE. */
    private void deleteImageIfNotDefault(String url) {
        if (!url.equals(DEFAULT_IMAGE)) {
            String absoluteImagePath = System.getProperty("user.dir") + url;
            Path path = Paths.get(absoluteImagePath);
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /** Deleta em disco todas as URLs passadas (exceto default). */
    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String imageUrl : imageUrls) {
                if (!imageUrl.equals(DEFAULT_IMAGE)) {
                    String absolutePath = System.getProperty("user.dir") + imageUrl;
                    try {
                        Files.deleteIfExists(Paths.get(absolutePath));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    /** Exclui um produto (e suas imagens) do banco. */
    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Deleta imagens do produto
        deleteImages(product.getImages());
        // Deleta imagens das variações
        if (product.getVariations() != null) {
            for (ProductVariation variation : product.getVariations()) {
                deleteImages(variation.getImages());
            }
        }
        productRepository.delete(product);
    }

    /** Busca um produto por ID e converte para DTO. */
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        return convertToDTO(product);
    }

    /** Lista todos os produtos com paginação. */
    public Page<ProductDTO> listAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findAll(pageable);
        return page.map(this::convertToDTO);
    }

    /** Lista produtos de um catálogo específico com paginação. */
    public Page<ProductDTO> listProductsByCatalog(String catalogId, Pageable pageable) {
        Page<Product> page = productRepository.findByCatalogId(catalogId, pageable);
        return page.map(this::convertToDTO);
    }

    /**
     * Mapeia dados do DTO para a entidade, sem alterar variações/especificações.
     */
    private void mapDtoToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setSkuCode(dto.getSkuCode());
        product.setSalePrice(dto.getSalePrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setUnitOfMeasure(dto.getUnitOfMeasure());
        product.setType(dto.getType());
        product.setCondition(dto.getCondition());
        product.setProductionType(dto.getProductionType());
        product.setExpirationDate(dto.getExpirationDate());
        product.setFreeShipping(dto.isFreeShipping());
        product.setNetWeight(dto.getNetWeight());
        product.setGrossWeight(dto.getGrossWeight());
        product.setWidth(dto.getWidth());
        product.setHeight(dto.getHeight());
        product.setDepth(dto.getDepth());
        product.setVolumes(dto.getVolumes());
        product.setItemsPerBox(dto.getItemsPerBox());
        product.setGtinEan(dto.getGtinEan());
        product.setGtinEanTax(dto.getGtinEanTax());
        product.setShortDescription(dto.getShortDescription());
        product.setComplementaryDescription(dto.getComplementaryDescription());
        product.setNotes(dto.getNotes());
        product.setStock(dto.getStock());
        product.setActive(dto.isActive());

        // Relacionamentos
        categoryRepository.findById(dto.getCategoryId())
                .ifPresentOrElse(product::setCategory,
                        () -> {throw new RuntimeException("Categoria não encontrada");});
        subCategoryRepository.findById(dto.getSubCategoryId())
                .ifPresentOrElse(product::setSubCategory,
                        () -> {throw new RuntimeException("Subcategoria não encontrada");});
        brandRepository.findById(dto.getBrandId())
                .ifPresentOrElse(product::setBrand,
                        () -> {throw new RuntimeException("Marca não encontrada");});
        catalogRepository.findById(dto.getCatalogId())
                .ifPresentOrElse(product::setCatalog,
                        () -> {throw new RuntimeException("Catálogo não encontrado");});
    }

    /**
     * Salva arquivos recebidos em FormData no sistema de arquivos e retorna as rotas.
     */
    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String uniqueFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                    String filePath = UPLOAD_DIR + uniqueFileName;
                    Path path = Paths.get(filePath);

                    // Garante que o diretório exista
                    Files.createDirectories(path.getParent());
                    // Escreve o arquivo em disco
                    Files.write(path, image.getBytes());

                    // Gera a rota final (p. ex. "/uploads/<arquivo>")
                    imagePaths.add("/uploads/" + uniqueFileName);
                }
            }
        }
        return imagePaths;
    }

    /**
     * Converte a entidade Product (com especificações e variações) para seu respectivo DTO.
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setImages(product.getImages());
        dto.setName(product.getName());
        dto.setSkuCode(product.getSkuCode());
        dto.setSalePrice(product.getSalePrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setUnitOfMeasure(product.getUnitOfMeasure());
        dto.setType(product.getType());
        dto.setCondition(product.getCondition());
        dto.setProductionType(product.getProductionType());
        dto.setExpirationDate(product.getExpirationDate());
        dto.setFreeShipping(product.isFreeShipping());
        dto.setNetWeight(product.getNetWeight());
        dto.setGrossWeight(product.getGrossWeight());
        dto.setWidth(product.getWidth());
        dto.setHeight(product.getHeight());
        dto.setDepth(product.getDepth());
        dto.setVolumes(product.getVolumes());
        dto.setItemsPerBox(product.getItemsPerBox());
        dto.setGtinEan(product.getGtinEan());
        dto.setGtinEanTax(product.getGtinEanTax());
        dto.setShortDescription(product.getShortDescription());
        dto.setComplementaryDescription(product.getComplementaryDescription());
        dto.setNotes(product.getNotes());
        dto.setStock(product.getStock());
        dto.setActive(product.isActive());
        dto.setCatalogId(product.getCatalog() != null ? product.getCatalog().getId() : null);
        dto.setProductTemplateId(product.getProductTemplate() != null ? product.getProductTemplate().getId() : null);

        // Marca, Categoria e Subcategoria
        dto.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);

        // Especificações Técnicas
        if (product.getTechnicalSpecifications() != null) {
            dto.setTechnicalSpecifications(product.getTechnicalSpecifications().stream().map(spec -> {
                TechnicalSpecificationDTO specDTO = new TechnicalSpecificationDTO();
                specDTO.setId(spec.getId());
                specDTO.setTitle(spec.getTitle());
                specDTO.setContent(spec.getContent());
                return specDTO;
            }).collect(Collectors.toList()));
        }

        // Variações
        if (product.getVariations() != null) {
            List<ProductVariationDTO> variationDTOs = product.getVariations().stream().map(var -> {
                ProductVariationDTO varDTO = new ProductVariationDTO();
                varDTO.setId(var.getId());
                varDTO.setPrice(var.getPrice());
                varDTO.setDiscountPrice(var.getDiscountPrice());
                varDTO.setStock(var.getStock());
                varDTO.setActive(var.isActive());
                varDTO.setImages(var.getImages());

                if (var.getAttributes() != null) {
                    List<VariationAttributeDTO> attrDTOs = var.getAttributes().stream().map(attr -> {
                        VariationAttributeDTO aDTO = new VariationAttributeDTO();
                        aDTO.setId(attr.getId());
                        aDTO.setAttributeName(attr.getAttributeName());
                        aDTO.setAttributeValue(attr.getAttributeValue());
                        return aDTO;
                    }).collect(Collectors.toList());
                    varDTO.setAttributes(attrDTOs);
                }

                return varDTO;
            }).collect(Collectors.toList());
            dto.setVariations(variationDTOs);
        }

        return dto;
    }
}
