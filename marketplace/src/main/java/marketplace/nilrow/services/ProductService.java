package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.*;
import marketplace.nilrow.repositories.BrandRepository;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.ProductRepository;
import marketplace.nilrow.repositories.ProductTemplateRepository;
import marketplace.nilrow.repositories.SubCategoryRepository;
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

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
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

    // Injetamos o repositório de templates
    @Autowired
    private ProductTemplateRepository productTemplateRepository;

    @Transactional
    public ProductDTO createProduct(
            ProductDTO dto,
            List<MultipartFile> productImages
    ) throws IOException {

        Product product = new Product();
        mapDtoToEntity(dto, product);

        // Salvar imagens do produto principal
        List<String> productImagePaths = saveImages(productImages);
        if (productImagePaths.isEmpty()) {
            product.setImages(List.of(DEFAULT_IMAGE));
        } else {
            product.setImages(productImagePaths);
        }

        // Especificações Técnicas
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

        // Variações (sem imagens)
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

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(
            String id,
            ProductDTO dto,
            List<MultipartFile> productImages
    ) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        mapDtoToEntity(dto, product);
        updateProductImages(product, dto.getImages(), productImages);
        updateTechnicalSpecifications(product, dto.getTechnicalSpecifications());
        updateProductVariations(product, dto.getVariations());
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        deleteImages(product.getImages());
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

    // -----------------------------------------------------------
    // Métodos auxiliares
    // -----------------------------------------------------------
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

        // --- NOVO: Se o DTO contiver productTemplateId, busca e setta o template ---
        if (dto.getProductTemplateId() != null && !dto.getProductTemplateId().isEmpty()) {
            productTemplateRepository.findById(dto.getProductTemplateId())
                    .ifPresentOrElse(product::setProductTemplate,
                            () -> { throw new RuntimeException("Template não encontrado"); });
        }
    }

    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String uniqueFileName = UUID.randomUUID().toString()
                            + "_" + image.getOriginalFilename();
                    String filePath = UPLOAD_DIR + uniqueFileName;
                    Path path = Paths.get(filePath);
                    Files.createDirectories(path.getParent());
                    Files.write(path, image.getBytes());
                    imagePaths.add("/uploads/" + uniqueFileName);
                }
            }
        }
        return imagePaths;
    }

    private void updateProductImages(Product product,
                                     List<String> desiredUrls,
                                     List<MultipartFile> productImages) throws IOException {

        List<String> oldUrls = (product.getImages() == null)
                ? new ArrayList<>()
                : new ArrayList<>(product.getImages());
        List<String> desired = (desiredUrls == null) ? new ArrayList<>() : desiredUrls;
        List<String> removedUrls = oldUrls.stream()
                .filter(url -> !desired.contains(url))
                .toList();
        for (String removedUrl : removedUrls) {
            deleteImageIfNotDefault(removedUrl);
        }
        List<String> finalUrls = new ArrayList<>(desired);
        List<String> newUploads = saveImages(productImages);
        finalUrls.addAll(newUploads);
        if (finalUrls.isEmpty()) {
            finalUrls = List.of(DEFAULT_IMAGE);
        }
        product.setImages(finalUrls);
    }

    private void updateTechnicalSpecifications(
            Product product,
            List<TechnicalSpecificationDTO> specsDTO
    ) {
        List<TechnicalSpecification> existingSpecs = product.getTechnicalSpecifications();
        if (existingSpecs == null) {
            existingSpecs = new ArrayList<>();
            product.setTechnicalSpecifications(existingSpecs);
        }
        Map<String, TechnicalSpecification> existingMap = existingSpecs.stream()
                .collect(Collectors.toMap(TechnicalSpecification::getId, s -> s));
        Set<String> specsToKeep = new HashSet<>();
        if (specsDTO != null) {
            for (TechnicalSpecificationDTO dto : specsDTO) {
                if (dto.getId() != null && existingMap.containsKey(dto.getId())) {
                    TechnicalSpecification existing = existingMap.get(dto.getId());
                    existing.setTitle(dto.getTitle());
                    existing.setContent(dto.getContent());
                    specsToKeep.add(dto.getId());
                } else {
                    TechnicalSpecification newSpec = new TechnicalSpecification();
                    newSpec.setTitle(dto.getTitle());
                    newSpec.setContent(dto.getContent());
                    newSpec.setProduct(product);
                    existingSpecs.add(newSpec);
                }
            }
        }
        existingSpecs.removeIf(spec ->
                spec.getId() != null && !specsToKeep.contains(spec.getId()));
    }

    private void updateProductVariations(
            Product product,
            List<ProductVariationDTO> variationDTOs
    ) {
        if (variationDTOs == null || variationDTOs.isEmpty()) {
            if (product.getVariations() != null) {
                product.getVariations().clear();
            }
            return;
        }
        if (product.getVariations() == null) {
            product.setVariations(new ArrayList<>());
        }
        List<ProductVariation> finalVariations = new ArrayList<>();
        for (ProductVariationDTO varDTO : variationDTOs) {
            ProductVariation variation;
            if (!product.getVariations().isEmpty()) {
                variation = product.getVariations().get(0);
            } else {
                variation = new ProductVariation();
                variation.setProduct(product);
            }
            variation.setName(varDTO.getName());
            variation.setPrice(varDTO.getPrice());
            variation.setDiscountPrice(varDTO.getDiscountPrice());
            variation.setStock(varDTO.getStock());
            variation.setActive(varDTO.isActive());
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
            finalVariations.add(variation);
        }
        product.getVariations().clear();
        product.getVariations().addAll(finalVariations);
    }

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

    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null) {
            for (String url : imageUrls) {
                deleteImageIfNotDefault(url);
            }
        }
    }

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
        dto.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setSubCategoryId(product.getSubCategory() != null ? product.getSubCategory().getId() : null);
        if (product.getProductTemplate() != null) {
            dto.setProductTemplateId(product.getProductTemplate().getId());
        }
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
        if (product.getVariations() != null) {
            List<ProductVariationDTO> variationDTOs = product.getVariations().stream().map(var -> {
                ProductVariationDTO varDTO = new ProductVariationDTO();
                varDTO.setId(var.getId());
                varDTO.setName(var.getName());
                varDTO.setPrice(var.getPrice());
                varDTO.setDiscountPrice(var.getDiscountPrice());
                varDTO.setStock(var.getStock());
                varDTO.setActive(var.isActive());
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
