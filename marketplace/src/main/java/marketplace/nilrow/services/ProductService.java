package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.location.Location;
import marketplace.nilrow.domain.catalog.product.*;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.repositories.*;
import marketplace.nilrow.util.GeoPoint;
import marketplace.nilrow.util.GeoUtils;
import marketplace.nilrow.util.OperatingHoursUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    private static final String DEFAULT_IMAGE = "/uploads/default-product.png";

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private GeocodingService geocodingService;

    // CREATE (com overload sem imagens)
    public ProductDTO createProduct(ProductDTO dto) throws IOException {
        return createProduct(dto, null);
    }

    public ProductDTO createProduct(ProductDTO dto, List<MultipartFile> images) throws IOException {
        Product product = new Product();

        // Preenche campos básicos
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

        // Associações obrigatórias (catálogo, categoria, subcategoria, marca)
        Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catalog not found"));
        product.setCatalog(catalog);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        SubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));
        product.setSubCategory(subCategory);

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        product.setBrand(brand);

        // Se tiver templateId no DTO (exemplo), associe aqui
        // if (dto.getTemplateId() != null) {
        //     ProductTemplate template = productTemplateRepository.findById(dto.getTemplateId())
        //         .orElseThrow(() -> new RuntimeException("Template not found"));
        //     product.setProductTemplate(template);
        // }

        // Upload de imagens
        List<String> uploadedImages = saveImages(images);
        product.setImages(uploadedImages.isEmpty()
                ? Collections.singletonList(DEFAULT_IMAGE)
                : uploadedImages);

        // Associação com outros produtos
        if (dto.getAssociatedIds() != null && !dto.getAssociatedIds().isEmpty()) {
            List<Product> associated = dto.getAssociatedIds().stream()
                    .map(assocId -> productRepository.findById(assocId)
                            .orElseThrow(() -> new RuntimeException("Associated product not found: " + assocId)))
                    .collect(Collectors.toList());
            product.setAssociated(associated);
        }

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    // UPDATE (com overload sem imagens)
    public ProductDTO updateProduct(String id, ProductDTO dto) throws IOException {
        return updateProduct(id, dto, null);
    }

    public ProductDTO updateProduct(String id, ProductDTO dto, List<MultipartFile> images) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Atualiza campos
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

        // Atualiza relacionamentos obrigatórios
        Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catalog not found"));
        product.setCatalog(catalog);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        SubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));
        product.setSubCategory(subCategory);

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        product.setBrand(brand);

        // Se quiser associar templateId:
        // if (dto.getTemplateId() != null) { ... }

        // Se vierem imagens novas, substitui as antigas
        if (images != null && !images.isEmpty()) {
            deleteImages(product.getImages());
            List<String> uploadedImages = saveImages(images);
            product.setImages(uploadedImages);
        }

        // Atualiza associações
        if (dto.getAssociatedIds() != null) {
            product.getAssociated().clear();
            List<Product> associated = dto.getAssociatedIds().stream()
                    .map(assocId -> productRepository.findById(assocId)
                            .orElseThrow(() -> new RuntimeException("Associated product not found: " + assocId)))
                    .collect(Collectors.toList());
            product.setAssociated(associated);
        }

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    // DELETE
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        deleteImages(product.getImages()); // Remove arquivos físicos
        productRepository.delete(product);
    }

    // GET BY ID
    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    // GET ALL
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET PRODUCTS BY CATALOG
    public List<ProductDTO> getProductsByCatalog(String catalogId) {
        return productRepository.findByCatalogId(catalogId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // SEARCH (sem template), filtrando por CEP, nome, horário, etc.
    public Page<Product> searchProductsByCepAndNameAndNoTemplate(String cep, String name, Pageable pageable) {
        GeoPoint point = geocodingService.geocode(cep);
        LocalTime now = LocalTime.now();
        String currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());

        // Busca produtos sem template e contendo nome (ignora maiúsc./minúsc.)
        List<Product> products = productRepository.findByProductTemplateIsNullAndNameContainingIgnoreCase(name);

        // Filtra pela localização e horário
        List<Product> filtered = products.stream().filter(p -> {
            String catalogId = p.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            boolean locationAllowed = locations.stream().anyMatch(loc -> GeoUtils.isLocationAllowed(point, loc));
            if (!locationAllowed) return false;

            Catalog c = p.getCatalog();
            return OperatingHoursUtils.isCatalogOpen(c, now, currentDay);
        }).collect(Collectors.toList());

        // Paginação manual
        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    // GET PRODUCTS (sem template) por CEP, horario (paginado)
    public Page<Product> getProductsByCepAndNoTemplatePaginated(String cep, Pageable pageable) {
        GeoPoint point = geocodingService.geocode(cep);
        LocalTime now = LocalTime.now();
        String currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());

        List<Product> products = productRepository.findByProductTemplateIsNull();

        List<Product> filtered = products.stream().filter(p -> {
            String catalogId = p.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            boolean locationAllowed = locations.stream().anyMatch(loc -> GeoUtils.isLocationAllowed(point, loc));
            if (!locationAllowed) return false;

            Catalog c = p.getCatalog();
            return OperatingHoursUtils.isCatalogOpen(c, now, currentDay);
        }).collect(Collectors.toList());

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    // FILTRA (sem template) por CEP, categoria, subcategoria (paginado)
    public Page<Product> getProductsByCepCategoryAndNoTemplate(String cep, String categoryId, String subCategoryId, Pageable pageable) {
        GeoPoint point = geocodingService.geocode(cep);
        LocalTime now = LocalTime.now();
        String currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());

        List<Product> products = productRepository.findByProductTemplateIsNull();

        List<Product> filtered = products.stream().filter(product -> {
            String catalogId = product.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            boolean locationAllowed = locations.stream().anyMatch(loc -> GeoUtils.isLocationAllowed(point, loc));
            if (!locationAllowed) return false;

            Catalog cat = product.getCatalog();
            if (!OperatingHoursUtils.isCatalogOpen(cat, now, currentDay)) return false;

            if (categoryId != null && !categoryId.trim().isEmpty()) {
                if (product.getCategory() == null || !product.getCategory().getId().equals(categoryId)) {
                    return false;
                }
            }
            if (subCategoryId != null && !subCategoryId.trim().isEmpty()) {
                if (product.getSubCategory() == null || !product.getSubCategory().getId().equals(subCategoryId)) {
                    return false;
                }
            }
            return true;
        }).collect(Collectors.toList());

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    // --------------------------------------------------
    // MÉTODOS AUXILIARES
    // --------------------------------------------------
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

        dto.setCatalogId(product.getCatalog().getId());
        dto.setCategoryId(product.getCategory().getId());
        dto.setSubCategoryId(product.getSubCategory().getId());
        dto.setBrandId(product.getBrand().getId());

        if (product.getAssociated() != null && !product.getAssociated().isEmpty()) {
            List<String> associatedIds = product.getAssociated().stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());
            dto.setAssociatedIds(associatedIds);
        }

        // Se usar template:
        // if (product.getProductTemplate() != null) {
        //    dto.setTemplateId(product.getProductTemplate().getId());
        // }

        return dto;
    }

    private List<String> saveImages(List<MultipartFile> images) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                String uniqueFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                String filePath = UPLOAD_DIR + uniqueFileName;
                Path path = Paths.get(filePath);
                Files.write(path, image.getBytes());
                imagePaths.add("/uploads/" + uniqueFileName);
            }
        }
        return imagePaths;
    }

    private void deleteImages(List<String> imageUrls) {
        if (imageUrls != null) {
            for (String imageUrl : imageUrls) {
                if (!imageUrl.equals(DEFAULT_IMAGE)) {
                    String absolutePath = System.getProperty("user.dir") + imageUrl;
                    Path path = Paths.get(absolutePath);
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
