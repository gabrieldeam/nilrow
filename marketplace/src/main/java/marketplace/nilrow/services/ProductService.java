package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.*;
import marketplace.nilrow.repositories.*;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.Catalog;

import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductVariation;
import marketplace.nilrow.domain.catalog.product.TechnicalSpecification;
import marketplace.nilrow.domain.catalog.product.VariationAttribute;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.domain.catalog.product.ProductVariationDTO;
import marketplace.nilrow.domain.catalog.product.TechnicalSpecificationDTO;
import marketplace.nilrow.domain.catalog.product.VariationAttributeDTO;

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
    private static final String DEFAULT_IMAGE = "/uploads/default_product.png";

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
     *
     * @param dto               DTO com dados do produto
     * @param productImages     Lista de imagens do produto principal (em FormData)
     * @param variationImages   Mapa de listas de imagens para cada variação (índice -> imagens)
     * @return DTO final do produto criado
     */
    @Transactional
    public ProductDTO createProduct(ProductDTO dto,
                                    List<MultipartFile> productImages,
                                    Map<Integer, List<MultipartFile>> variationImages) throws IOException {

        Product product = new Product();
        mapDtoToEntity(dto, product);

        // ------------------------------
        // Salvar imagens do produto principal
        // ------------------------------
        List<String> productImagePaths = saveImages(productImages);
        if (productImagePaths.isEmpty()) {
            product.setImages(Collections.singletonList(DEFAULT_IMAGE));
        } else {
            product.setImages(productImagePaths);
        }

        // ------------------------------
        // Especificações Técnicas
        // ------------------------------
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

        // ------------------------------
        // Variações (com imagens e atributos)
        // ------------------------------
        if (dto.getVariations() != null && !dto.getVariations().isEmpty()) {
            List<ProductVariation> variations = new ArrayList<>();
            for (int i = 0; i < dto.getVariations().size(); i++) {
                ProductVariationDTO varDTO = dto.getVariations().get(i);

                // Mapeia DTO -> Entidade
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

        // Persiste no banco
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    /**
     * Atualiza completamente um produto, suas especificações, variações e imagens.
     * Caso sejam enviadas novas imagens, as antigas são removidas e substituídas.
     *
     * @param id               ID do produto a atualizar
     * @param dto              DTO com os novos dados do produto
     * @param productImages    Lista de imagens do produto principal (em FormData)
     * @param variationImages  Mapa de listas de imagens para cada variação (índice -> imagens)
     * @return DTO final do produto atualizado
     */
    @Transactional
    public ProductDTO updateProduct(String id,
                                    ProductDTO dto,
                                    List<MultipartFile> productImages,
                                    Map<Integer, List<MultipartFile>> variationImages) throws IOException {

        // 1) Carrega o produto do banco
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // 2) Atualiza campos básicos (nome, preço, etc.),
        //    mas NÃO mexe ainda em variações/especificações/imagens
        mapDtoToEntity(dto, product);

        // ----------------------------------------------------------
        // 3) ATUALIZA IMAGENS DO PRODUTO PRINCIPAL DE FORMA PARCIAL
        // ----------------------------------------------------------
        // Ex.: dto.getImages() contém as URLs que o usuário quer manter
        //      productImages (MultipartFile) contém arquivos novos para upload
        updateProductImages(product, dto.getImages(), productImages);

        // ----------------------------------------------------------
        // 4) ATUALIZA ESPECIFICAÇÕES TÉCNICAS
        // ----------------------------------------------------------
        // Preservar IDs existentes. Precisamos comparar o que veio no DTO
        // com o que existe no banco.
        updateTechnicalSpecifications(product, dto.getTechnicalSpecifications());

        // ----------------------------------------------------------
        // 5) ATUALIZA VARIAÇÕES (E SUAS IMAGENS E ATRIBUTOS)
        // ----------------------------------------------------------
        updateProductVariations(product, dto.getVariations(), variationImages);

        // 6) Persiste alterações e retorna o DTO
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Atualiza a lista de imagens do produto principal, mantendo as URLs antigas
     * que o usuário ainda quer, removendo as que saíram do DTO e adicionando novas
     * que vieram em 'productImages'.
     */
    private void updateProductImages(Product product,
                                     List<String> desiredUrls,
                                     List<MultipartFile> productImages) throws IOException {
        List<String> oldUrls = product.getImages() == null
                ? new ArrayList<>()
                : new ArrayList<>(product.getImages());

        final List<String> desired = desiredUrls == null ? new ArrayList<>() : desiredUrls;

        // Identifica URLs removidas pelo usuário
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .collect(Collectors.toList());

        // Deleta as imagens removidas (exceto DEFAULT_IMAGE)
        removedUrls.forEach(this::deleteImageIfNotDefault);

        // Lista final inicia com as URLs que o usuário deseja manter
        List<String> finalUrls = new ArrayList<>(desired);

        // Faz upload de novas imagens e adiciona à lista final
        List<String> newUploads = saveImages(productImages);
        finalUrls.addAll(newUploads);

        if (finalUrls.isEmpty()) {
            finalUrls = Collections.singletonList(DEFAULT_IMAGE);
        }

        product.setImages(finalUrls);
    }


    private void updateTechnicalSpecifications(Product product,
                                               List<TechnicalSpecificationDTO> specsDTO) {
        // Mapa [specId -> TechnicalSpecification] existentes no BD
        Map<String, TechnicalSpecification> existingMap = product.getTechnicalSpecifications() == null
                ? new HashMap<>()
                : product.getTechnicalSpecifications().stream()
                .collect(Collectors.toMap(TechnicalSpecification::getId, s -> s));

        // Nova lista que irá substituir product.getTechnicalSpecifications()
        List<TechnicalSpecification> finalList = new ArrayList<>();

        if (specsDTO != null) {
            for (TechnicalSpecificationDTO dto : specsDTO) {
                if (dto.getId() != null && existingMap.containsKey(dto.getId())) {
                    // É uma spec EXISTENTE -> atualiza campos
                    TechnicalSpecification existing = existingMap.get(dto.getId());
                    existing.setTitle(dto.getTitle());
                    existing.setContent(dto.getContent());
                    finalList.add(existing);
                    // Remove do mapa para sabermos que já processamos
                    existingMap.remove(dto.getId());
                } else {
                    // É uma NOVA spec -> criar instância
                    TechnicalSpecification newSpec = new TechnicalSpecification();
                    newSpec.setTitle(dto.getTitle());
                    newSpec.setContent(dto.getContent());
                    newSpec.setProduct(product);
                    finalList.add(newSpec);
                }
            }
        }

        // Tudo que sobrou em existingMap são specs que o usuário removeu
        // Não adicionamos ao finalList, então elas serão perdidas (removidas)
        // do banco de dados pois definimos orphanRemoval = true.

        // Substitui a lista inteira no produto
        product.setTechnicalSpecifications(finalList);
    }

    private void updateProductVariations(Product product,
                                         List<ProductVariationDTO> variationDTOs,
                                         Map<Integer, List<MultipartFile>> variationImages) throws IOException {

        Map<String, ProductVariation> existingVariations = product.getVariations() == null
                ? new HashMap<>()
                : product.getVariations().stream()
                .collect(Collectors.toMap(ProductVariation::getId, v -> v));

        List<ProductVariation> finalVariations = new ArrayList<>();

        if (variationDTOs != null) {
            for (int i = 0; i < variationDTOs.size(); i++) {
                ProductVariationDTO varDTO = variationDTOs.get(i);
                String varId = varDTO.getId();

                ProductVariation variation;
                if (varId != null && existingVariations.containsKey(varId)) {
                    // A variação já existe no banco -> atualiza
                    variation = existingVariations.get(varId);
                    existingVariations.remove(varId);
                } else {
                    // Criar nova variação
                    variation = new ProductVariation();
                    variation.setProduct(product);
                }

                // Atualiza campos básicos da variação
                variation.setPrice(varDTO.getPrice());
                variation.setDiscountPrice(varDTO.getDiscountPrice());
                variation.setStock(varDTO.getStock());
                variation.setActive(varDTO.isActive());

                // ATUALIZA IMAGENS DA VARIAÇÃO (parcial)
                List<String> desiredUrls = varDTO.getImages(); // URLs que user quer manter
                List<MultipartFile> newImages = variationImages.get(i); // novas imagens upload
                updateVariationImages(variation, desiredUrls, newImages);

                // ATUALIZA ATRIBUTOS (IDs preservados)
                updateVariationAttributes(variation, varDTO.getAttributes());

                finalVariations.add(variation);
            }
        }

        // Qualquer variação remanescente em existingVariations não está mais no DTO -> remover
        // Também precisamos deletar suas imagens do disco.
        for (ProductVariation removed : existingVariations.values()) {
            deleteImages(removed.getImages());
        }

        product.setVariations(finalVariations);
    }

    private void updateVariationImages(ProductVariation variation,
                                       List<String> desiredUrls,
                                       List<MultipartFile> newImages) throws IOException {
        List<String> oldUrls = variation.getImages() == null
                ? new ArrayList<>()
                : new ArrayList<>(variation.getImages());

        // Cria uma variável final com as URLs desejadas (se nulas, cria um ArrayList vazio)
        final List<String> desired = desiredUrls == null ? new ArrayList<>() : desiredUrls;

        // Descobre quais URLs antigas foram removidas
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .collect(Collectors.toList());

        // Deleta fisicamente as removidas
        removedUrls.forEach(this::deleteImageIfNotDefault);

        // Inicia a lista final com as URLs mantidas
        List<String> finalUrls = new ArrayList<>(desired);

        // Faz upload das novas imagens e adiciona ao final da lista
        List<String> uploaded = saveImages(newImages);
        finalUrls.addAll(uploaded);

        if (finalUrls.isEmpty()) {
            finalUrls = Collections.singletonList(DEFAULT_IMAGE);
        }

        variation.setImages(finalUrls);
    }


    private void updateVariationAttributes(ProductVariation variation,
                                           List<VariationAttributeDTO> attrDTOs) {
        Map<String, VariationAttribute> existingAttrs = variation.getAttributes() == null
                ? new HashMap<>()
                : variation.getAttributes().stream()
                .collect(Collectors.toMap(VariationAttribute::getId, a -> a));

        List<VariationAttribute> finalAttrs = new ArrayList<>();

        if (attrDTOs != null) {
            for (VariationAttributeDTO dto : attrDTOs) {
                String attrId = dto.getId();

                VariationAttribute attribute;
                if (attrId != null && existingAttrs.containsKey(attrId)) {
                    // Atualiza existente
                    attribute = existingAttrs.get(attrId);
                    existingAttrs.remove(attrId);
                } else {
                    // Novo atributo
                    attribute = new VariationAttribute();
                    attribute.setVariation(variation);
                }

                attribute.setAttributeName(dto.getAttributeName());
                attribute.setAttributeValue(dto.getAttributeValue());
                finalAttrs.add(attribute);
            }
        }

        // O que sobrou em existingAttrs é removido
        variation.setAttributes(finalAttrs);
    }

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


    /**
     * Exclui um produto (e suas imagens do disco).
     */
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

    /**
     * Busca um produto por ID e converte para DTO.
     */
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        return convertToDTO(product);
    }

    public Page<ProductDTO> listAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findAll(pageable);
        return page.map(this::convertToDTO);
    }

    public Page<ProductDTO> listProductsByCatalog(String catalogId, Pageable pageable) {
        Page<Product> page = productRepository.findByCatalogId(catalogId, pageable);
        return page.map(this::convertToDTO);
    }

    // -------------------------------------------------------------------------
    // Métodos auxiliares
    // -------------------------------------------------------------------------

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
                    // Gera a rota final, por ex: "/uploads/<arquivo>"
                    imagePaths.add("/uploads/" + uniqueFileName);
                }
            }
        }
        return imagePaths;
    }

    /**
     * Remove fisicamente as imagens do sistema de arquivos.
     */
    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String imageUrl : imageUrls) {
                // Evita remover a imagem default
                if (!imageUrl.equals(DEFAULT_IMAGE)) {
                    String absoluteImagePath = System.getProperty("user.dir") + imageUrl;
                    Path path = Paths.get(absoluteImagePath);
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
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
                        VariationAttributeDTO attrDTO = new VariationAttributeDTO();
                        attrDTO.setId(attr.getId());
                        attrDTO.setAttributeName(attr.getAttributeName());
                        attrDTO.setAttributeValue(attr.getAttributeValue());
                        return attrDTO;
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
