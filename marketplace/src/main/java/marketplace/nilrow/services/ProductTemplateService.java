package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.location.Location;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplate;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateDTO;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateVariation;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateVariationDTO;
import marketplace.nilrow.repositories.BrandRepository;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.LocationRepository;
import marketplace.nilrow.repositories.ProductRepository;
import marketplace.nilrow.repositories.ProductTemplateRepository;
import marketplace.nilrow.repositories.SubCategoryRepository;
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
public class ProductTemplateService {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @Autowired
    private ProductTemplateRepository templateRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private GeocodingService geocodingService;

    // Sobrecarga para criação sem imagens
    public ProductTemplateDTO createTemplate(ProductTemplateDTO dto) throws IOException {
        return createTemplate(dto, null);
    }

    // Sobrecarga para atualização sem imagens
    public ProductTemplateDTO updateTemplate(String id, ProductTemplateDTO dto) throws IOException {
        return updateTemplate(id, dto, null);
    }


    // Criar Template com tratamento de imagens
    public ProductTemplateDTO createTemplate(ProductTemplateDTO dto, List<MultipartFile> images) throws IOException {
        ProductTemplate template = convertToEntity(dto);
        List<String> imagePaths = saveImages(images);
        if (!imagePaths.isEmpty()) {
            template.setImages(imagePaths);
        } else {
            template.setImages(Collections.singletonList(DEFAULT_IMAGE));
        }
        ProductTemplate savedTemplate = templateRepository.save(template);
        return convertToDTO(savedTemplate);
    }

    // Atualizar Template com tratamento de imagens
    public ProductTemplateDTO updateTemplate(String id, ProductTemplateDTO dto, List<MultipartFile> images) throws IOException {
        ProductTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        // Atualiza os campos básicos
        template.setName(dto.getName());
        template.setNetWeight(dto.getNetWeight());
        template.setGrossWeight(dto.getGrossWeight());
        template.setUnitOfMeasure(dto.getUnitOfMeasure());
        template.setItemsPerBox(dto.getItemsPerBox());

        // Atualiza relacionamentos
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        template.setCategory(category);

        SubCategory subCategory = subCategoryRepository.findById(dto.getSubCategoryId())
                .orElseThrow(() -> new RuntimeException("Subcategoria não encontrada"));
        template.setSubCategory(subCategory);

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));
        template.setBrand(brand);

        // Atualiza variações (neste exemplo, substituímos as variações existentes)
        if (dto.getVariations() != null) {
            List<ProductTemplateVariation> variations = dto.getVariations().stream()
                    .map(this::convertVariationToEntity)
                    .collect(Collectors.toList());
            variations.forEach(v -> v.setProductTemplate(template));
            template.setVariations(variations);
        }

        // Tratamento de imagens: se novas imagens forem fornecidas, remove as antigas e salva as novas
        if (images != null && !images.isEmpty()) {
            deleteImages(template.getImages());
            List<String> imagePaths = saveImages(images);
            template.setImages(imagePaths);
        }

        ProductTemplate updatedTemplate = templateRepository.save(template);
        return convertToDTO(updatedTemplate);
    }

    // Buscar Template por ID
    public ProductTemplateDTO getTemplateById(String id) {
        ProductTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        return convertToDTO(template);
    }

    // Listar todos os Templates
    public List<ProductTemplateDTO> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Listar produtos associados a um template
    public List<Product> getProductsByTemplate(String templateId) {
        ProductTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        return template.getProducts();
    }

    // Filtrar os produtos do template pelo CEP
    public List<Product> getProductsByTemplateAndCep(String templateId, String cep) {
        GeoPoint point = geocodingService.geocode(cep);
        ProductTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        List<Product> products = template.getProducts();
        return products.stream().filter(product -> {
            String catalogId = product.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            for (Location loc : locations) {
                if (GeoUtils.isLocationAllowed(point, loc)) {
                    return true;
                }
            }
            return false;
        }).collect(Collectors.toList());
    }

    // Filtrar os produtos do template pelo CEP e horário de funcionamento
    public List<Product> getProductsByTemplateAndCepAndOperatingHours(String templateId, String cep) {
        GeoPoint point = geocodingService.geocode(cep);
        ProductTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        List<Product> products = template.getProducts();
        LocalTime now = LocalTime.now();
        String currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());
        return products.stream().filter(product -> {
            String catalogId = product.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            boolean locationAllowed = locations.stream()
                    .anyMatch(loc -> GeoUtils.isLocationAllowed(point, loc));
            if (!locationAllowed) {
                return false;
            }
            Catalog catalog = product.getCatalog();
            return OperatingHoursUtils.isCatalogOpen(catalog, now, currentDay);
        }).collect(Collectors.toList());
    }

    // Filtrar os produtos do template com base em CEP, horário, categoria e subcategoria, com paginação
    public Page<Product> getProductsByTemplateAndFilters(String templateId, String cep, String categoryId, String subCategoryId, Pageable pageable) {
        GeoPoint point = geocodingService.geocode(cep);
        ProductTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        List<Product> products = template.getProducts();
        LocalTime now = LocalTime.now();
        String currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());
        List<Product> filtered = products.stream().filter(product -> {
            String catalogId = product.getCatalog().getId();
            List<Location> locations = locationRepository.findByCatalogId(catalogId);
            boolean locationAllowed = locations.stream().anyMatch(loc -> GeoUtils.isLocationAllowed(point, loc));
            if (!locationAllowed) {
                return false;
            }
            Catalog catalog = product.getCatalog();
            if (!OperatingHoursUtils.isCatalogOpen(catalog, now, currentDay)) {
                return false;
            }
            if (categoryId != null && !categoryId.isEmpty()) {
                if (product.getCategory() == null || !product.getCategory().getId().equals(categoryId)) {
                    return false;
                }
            }
            if (subCategoryId != null && !subCategoryId.isEmpty()) {
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

    public Page<ProductTemplateDTO> searchTemplatesByName(String name, Pageable pageable) {
        Page<ProductTemplate> page = templateRepository.findByNameContainingIgnoreCase(name, pageable);
        return page.map(this::convertToDTO);
    }

    public Page<ProductTemplateDTO> searchTemplatesByNameWithFilters(String name, String cep, Pageable pageable) {
        Page<ProductTemplate> pageUnpaged = templateRepository.findByNameContainingIgnoreCase(name, Pageable.unpaged());
        List<ProductTemplate> templates = pageUnpaged.getContent();
        GeoPoint point = null;
        LocalTime now = null;
        String currentDay = null;
        if (cep != null && !cep.trim().isEmpty()) {
            point = geocodingService.geocode(cep);
            now = LocalTime.now();
            currentDay = OperatingHoursUtils.getPortugueseDayName(java.time.LocalDate.now().getDayOfWeek());
        }
        final GeoPoint finalPoint = point;
        final LocalTime finalNow = now;
        final String finalCurrentDay = currentDay;
        List<ProductTemplate> filtered = templates.stream().filter(template -> {
            if (finalPoint == null) {
                return true;
            }
            List<Product> products = template.getProducts();
            if (products == null || products.isEmpty()) {
                return false;
            }
            boolean hasValid = products.stream().anyMatch(product -> {
                String catalogId = product.getCatalog().getId();
                List<Location> locations = locationRepository.findByCatalogId(catalogId);
                boolean locationAllowed = locations.stream().anyMatch(loc -> GeoUtils.isLocationAllowed(finalPoint, loc));
                if (!locationAllowed) {
                    return false;
                }
                Catalog catalog = product.getCatalog();
                return OperatingHoursUtils.isCatalogOpen(catalog, finalNow, finalCurrentDay);
            });
            return hasValid;
        }).collect(Collectors.toList());
        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<ProductTemplateDTO> dtos = filtered.subList(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, filtered.size());
    }

    // Método para converter o ProductTemplateDTO em ProductTemplate
    private ProductTemplate convertToEntity(ProductTemplateDTO dto) {
        ProductTemplate template = new ProductTemplate();
        template.setId(dto.getId());
        template.setImages(dto.getImages());
        template.setName(dto.getName());
        template.setNetWeight(dto.getNetWeight());
        template.setGrossWeight(dto.getGrossWeight());
        template.setUnitOfMeasure(dto.getUnitOfMeasure());
        template.setItemsPerBox(dto.getItemsPerBox());
        if (dto.getVariations() != null) {
            List<ProductTemplateVariation> variations = dto.getVariations().stream()
                    .map(this::convertVariationToEntity)
                    .collect(Collectors.toList());
            variations.forEach(v -> v.setProductTemplate(template));
            template.setVariations(variations);
        }
        return template;
    }

    // Renomeado para evitar ambiguidade
    private ProductTemplateVariation convertVariationToEntity(ProductTemplateVariationDTO dto) {
        ProductTemplateVariation variation = new ProductTemplateVariation();
        variation.setId(dto.getId());
        variation.setAttributeName(dto.getAttributeName());
        variation.setPossibleValues(dto.getPossibleValues());
        return variation;
    }

    // Método para converter ProductTemplate em ProductTemplateDTO
    private ProductTemplateDTO convertToDTO(ProductTemplate template) {
        ProductTemplateDTO dto = new ProductTemplateDTO();
        dto.setId(template.getId());
        dto.setImages(template.getImages());
        dto.setName(template.getName());
        dto.setNetWeight(template.getNetWeight());
        dto.setGrossWeight(template.getGrossWeight());
        dto.setUnitOfMeasure(template.getUnitOfMeasure());
        dto.setItemsPerBox(template.getItemsPerBox());
        dto.setCategoryId(template.getCategory() != null ? template.getCategory().getId() : null);
        dto.setSubCategoryId(template.getSubCategory() != null ? template.getSubCategory().getId() : null);
        dto.setBrandId(template.getBrand() != null ? template.getBrand().getId() : null);
        if (template.getVariations() != null) {
            dto.setVariations(template.getVariations().stream()
                    .map(v -> new ProductTemplateVariationDTO(v.getId(), v.getAttributeName(), v.getPossibleValues()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // Métodos para tratamento de imagens
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
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String imageUrl : imageUrls) {
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
}
