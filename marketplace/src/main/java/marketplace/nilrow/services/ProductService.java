package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.*;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
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

    // Diretório base onde as imagens do produto serão salvas
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    // Caminho default caso o produto não possua imagens
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
     * Cria um produto completo, porém SEM gerenciar imagens de variação.
     * As variações são criadas somente com atributos básicos (preço, estoque, etc.).
     */
    @Transactional
    public ProductDTO createProduct(
            ProductDTO dto,
            List<MultipartFile> productImages // SOMENTE imagens do produto principal
    ) throws IOException {

        Product product = new Product();
        mapDtoToEntity(dto, product);

        // 1) Salvar imagens do produto principal
        List<String> productImagePaths = saveImages(productImages);
        if (productImagePaths.isEmpty()) {
            product.setImages(List.of(DEFAULT_IMAGE));
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

        // 3) Variações (sem imagens!)
        if (dto.getVariations() != null && !dto.getVariations().isEmpty()) {
            List<ProductVariation> variations = new ArrayList<>();
            for (ProductVariationDTO varDTO : dto.getVariations()) {
                ProductVariation variation = new ProductVariation();
                variation.setName(varDTO.getName());
                variation.setPrice(varDTO.getPrice());
                variation.setDiscountPrice(varDTO.getDiscountPrice());
                variation.setStock(varDTO.getStock());
                variation.setActive(varDTO.isActive());
                variation.setProduct(product);

                // Atributos
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

        // 4) Salva no banco
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    /**
     * Atualiza o produto, mas NÃO gerencia imagens de variação.
     */
    @Transactional
    public ProductDTO updateProduct(
            String id,
            ProductDTO dto,
            List<MultipartFile> productImages // SOMENTE imagens do produto principal
    ) throws IOException {

        // 1) Carrega o produto do banco
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // 2) Atualiza campos básicos
        mapDtoToEntity(dto, product);

        // 3) Atualiza imagens do produto principal
        updateProductImages(product, dto.getImages(), productImages);

        // 4) Atualiza specs
        updateTechnicalSpecifications(product, dto.getTechnicalSpecifications());

        // 5) Atualiza variações (sem imagens)
        updateProductVariations(product, dto.getVariations());

        // 6) Salva e retorna
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Exclui o produto e suas imagens do disco.
     * NÃO deleta imagens de variação pois não estamos gerenciando isso aqui.
     */
    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Deleta imagens do produto principal
        deleteImages(product.getImages());

        // Se quiser, pode remover variações do banco,
        // mas as imagens da variação são responsabilidade de outra API.
        productRepository.delete(product);
    }

    @Transactional
    public Page<ProductDTO> searchProducts(String term, Pageable pageable) {
        Page<Product> page = productRepository.findByNameContainingIgnoreCaseOrSkuCodeContainingIgnoreCase(term, term, pageable);
        return page.map(this::convertToDTO);
    }

    public Page<ProductDTO> searchProductsByCatalog(String catalogId, String term, Pageable pageable) {
        Page<Product> page = productRepository.searchProductsByCatalog(catalogId, term, pageable);
        return page.map(this::convertToDTO);
    }


    /**
     * Busca um produto por ID.
     */
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        return convertToDTO(product);
    }

    /**
     * Lista todos os produtos com paginação.
     */
    public Page<ProductDTO> listAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findAll(pageable);
        return page.map(this::convertToDTO);
    }

    /**
     * Lista produtos de um catálogo, com paginação.
     */
    public Page<ProductDTO> listProductsByCatalog(String catalogId, Pageable pageable) {
        Page<Product> page = productRepository.findByCatalogId(catalogId, pageable);
        return page.map(this::convertToDTO);
    }

    // -----------------------------------------------------------
    // Métodos auxiliares
    // -----------------------------------------------------------

    /**
     * Copia campos do DTO para a entidade, sem mexer em specs/variations.
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
                        () -> { throw new RuntimeException("Categoria não encontrada"); });
        subCategoryRepository.findById(dto.getSubCategoryId())
                .ifPresentOrElse(product::setSubCategory,
                        () -> { throw new RuntimeException("Subcategoria não encontrada"); });
        brandRepository.findById(dto.getBrandId())
                .ifPresentOrElse(product::setBrand,
                        () -> { throw new RuntimeException("Marca não encontrada"); });
        catalogRepository.findById(dto.getCatalogId())
                .ifPresentOrElse(product::setCatalog,
                        () -> { throw new RuntimeException("Catálogo não encontrado"); });
    }

    /**
     * Salva as imagens do produto principal no disco, retornando a lista de URLs.
     */
    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String uniqueFileName = UUID.randomUUID().toString()
                            + "_" + image.getOriginalFilename();
                    String filePath = UPLOAD_DIR + uniqueFileName;
                    Path path = Paths.get(filePath);

                    // Garante que o diretório exista
                    Files.createDirectories(path.getParent());

                    // Salva o arquivo
                    Files.write(path, image.getBytes());

                    // Gera a rota final
                    imagePaths.add("/uploads/" + uniqueFileName);
                }
            }
        }
        return imagePaths;
    }

    /**
     * Atualiza a lista de imagens do produto principal.
     * Se remover URLs antigas do DTO, elas são deletadas.
     * Se não sobrar nenhuma, definimos DEFAULT_IMAGE.
     */
    private void updateProductImages(Product product,
                                     List<String> desiredUrls,
                                     List<MultipartFile> productImages) throws IOException {

        List<String> oldUrls = (product.getImages() == null)
                ? new ArrayList<>()
                : new ArrayList<>(product.getImages());

        // As URLs que o usuário quer manter
        List<String> desired = (desiredUrls == null) ? new ArrayList<>() : desiredUrls;

        // Acha as URLs removidas
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .toList();

        // Deleta fisicamente
        for (String removedUrl : removedUrls) {
            deleteImageIfNotDefault(removedUrl);
        }

        // Final começa com as URLs desejadas
        List<String> finalUrls = new ArrayList<>(desired);

        // Upload das novas imagens
        List<String> newUploads = saveImages(productImages);
        finalUrls.addAll(newUploads);

        if (finalUrls.isEmpty()) {
            finalUrls = List.of(DEFAULT_IMAGE);
        }

        product.setImages(finalUrls);
    }

    /**
     * Atualiza a ficha técnica do produto (TechnicalSpecification).
     */
    private void updateTechnicalSpecifications(
            Product product,
            List<TechnicalSpecificationDTO> specsDTO
    ) {
        List<TechnicalSpecification> existingSpecs = product.getTechnicalSpecifications();
        if (existingSpecs == null) {
            existingSpecs = new ArrayList<>();
            product.setTechnicalSpecifications(existingSpecs);
        }

        // Mapeia as existentes por ID
        Map<String, TechnicalSpecification> existingMap = existingSpecs.stream()
                .collect(Collectors.toMap(TechnicalSpecification::getId, s -> s));

        Set<String> specsToKeep = new HashSet<>();

        if (specsDTO != null) {
            for (TechnicalSpecificationDTO dto : specsDTO) {
                if (dto.getId() != null && existingMap.containsKey(dto.getId())) {
                    // Atualiza
                    TechnicalSpecification existing = existingMap.get(dto.getId());
                    existing.setTitle(dto.getTitle());
                    existing.setContent(dto.getContent());
                    specsToKeep.add(dto.getId());
                } else {
                    // Cria nova
                    TechnicalSpecification newSpec = new TechnicalSpecification();
                    newSpec.setTitle(dto.getTitle());
                    newSpec.setContent(dto.getContent());
                    newSpec.setProduct(product);
                    existingSpecs.add(newSpec);
                }
            }
        }

        // Remove as specs que não constam mais no DTO
        existingSpecs.removeIf(spec ->
                spec.getId() != null && !specsToKeep.contains(spec.getId()));
    }

    /**
     * Atualiza variações sem lidar com imagens (já que não é mais responsabilidade daqui).
     */
    private void updateProductVariations(
            Product product,
            List<ProductVariationDTO> variationDTOs
    ) {
        // Se não houver variações, apaga todas
        if (variationDTOs == null || variationDTOs.isEmpty()) {
            if (product.getVariations() != null) {
                product.getVariations().clear();
            }
            return;
        }

        if (product.getVariations() == null) {
            product.setVariations(new ArrayList<>());
        }

        // Gera nova lista na ordem do front
        List<ProductVariation> finalVariations = new ArrayList<>();

        for (int i = 0; i < variationDTOs.size(); i++) {
            ProductVariationDTO varDTO = variationDTOs.get(i);

            // Tenta reaproveitar
            ProductVariation variation;
            if (i < product.getVariations().size()) {
                variation = product.getVariations().get(i);
            } else {
                variation = new ProductVariation();
                variation.setProduct(product);
            }

            // Campos principais
            variation.setName(varDTO.getName());
            variation.setPrice(varDTO.getPrice());
            variation.setDiscountPrice(varDTO.getDiscountPrice());
            variation.setStock(varDTO.getStock());
            variation.setActive(varDTO.isActive());

            // Atributos
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
                if (variation.getAttributes() != null) {
                    variation.getAttributes().clear();
                }
            }

            finalVariations.add(variation);
        }

        // Se havia mais variações no banco do que no DTO, remove as extras
        if (product.getVariations().size() > variationDTOs.size()) {
            // As sobras são removidas
        }

        // Substitui
        product.getVariations().clear();
        product.getVariations().addAll(finalVariations);
    }

    /**
     * Deleta um arquivo do disco se não for o DEFAULT_IMAGE.
     */
    private void deleteImageIfNotDefault(String url) {
        if (url != null && !url.equals(DEFAULT_IMAGE)) {
            String absolutePath = System.getProperty("user.dir") + url;
            Path path = Paths.get(absolutePath);
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Deleta múltiplas URLs do disco (exceto default).
     */
    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null) {
            for (String url : imageUrls) {
                deleteImageIfNotDefault(url);
            }
        }
    }

    /**
     * Converte a entidade Product para DTO, sem imagens de variação.
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

        // Marca, Categoria e Subcategoria
        dto.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);

        // Se tiver template
        if (product.getProductTemplate() != null) {
            dto.setProductTemplateId(product.getProductTemplate().getId());
        }

        // Especificações Técnicas
        if (product.getTechnicalSpecifications() != null) {
            dto.setTechnicalSpecifications(
                    product.getTechnicalSpecifications().stream().map(spec -> {
                        TechnicalSpecificationDTO specDTO = new TechnicalSpecificationDTO();
                        specDTO.setId(spec.getId());
                        specDTO.setTitle(spec.getTitle());
                        specDTO.setContent(spec.getContent());
                        return specDTO;
                    }).collect(Collectors.toList())
            );
        }

        // Variações (SEM imagens)
        if (product.getVariations() != null) {
            List<ProductVariationDTO> variationDTOs = product.getVariations().stream().map(var -> {
                ProductVariationDTO varDTO = new ProductVariationDTO();
                varDTO.setId(var.getId());
                varDTO.setName(var.getName());
                varDTO.setPrice(var.getPrice());
                varDTO.setDiscountPrice(var.getDiscountPrice());
                varDTO.setStock(var.getStock());
                varDTO.setActive(var.isActive());

                // Atributos
                if (var.getAttributes() != null) {
                    varDTO.setAttributes(var.getAttributes().stream().map(attr -> {
                        VariationAttributeDTO aDTO = new VariationAttributeDTO();
                        aDTO.setId(attr.getId());
                        aDTO.setAttributeName(attr.getAttributeName());
                        aDTO.setAttributeValue(attr.getAttributeValue());
                        return aDTO;
                    }).collect(Collectors.toList()));
                }

                return varDTO;
            }).collect(Collectors.toList());
            dto.setVariations(variationDTOs);
        }

        return dto;
    }
}
