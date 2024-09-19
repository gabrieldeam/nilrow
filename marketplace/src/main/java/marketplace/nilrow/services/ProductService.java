package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private CatalogRepository catalogRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    // Criar Produto
    public ProductDTO createProduct(ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        Product product = convertToEntity(productDTO);
        // Tratamento de imagens
        List<String> imagePaths = saveImages(images);
        if (!imagePaths.isEmpty()) {
            product.setImages(imagePaths);
        } else {
            product.setImages(Collections.singletonList(DEFAULT_IMAGE));
        }
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    // Atualizar Produto
    public ProductDTO updateProduct(String productId, ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Produto não encontrado");
        }
        Product product = productOpt.get();

        // Excluir imagens antigas se novas imagens forem fornecidas
        if (images != null && !images.isEmpty()) {
            deleteImages(product.getImages());
            List<String> imagePaths = saveImages(images);
            product.setImages(imagePaths);
        }

        // Atualizar outros campos
        updateProductFromDTO(product, productDTO);

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    // Deletar Produto
    public void deleteProduct(String productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // Excluir imagens
            deleteImages(product.getImages());
            productRepository.delete(product);
        } else {
            throw new RuntimeException("Produto não encontrado");
        }
    }

    // Obter Produto por ID
    public ProductDTO getProductById(String productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Produto não encontrado");
        }
        return convertToDTO(productOpt.get());
    }

    // Obter Produtos por Catálogo
    public List<ProductDTO> getProductsByCatalog(String catalogId) {
        List<Product> products = productRepository.findByCatalogId(catalogId);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Métodos Auxiliares

    private Product convertToEntity(ProductDTO productDTO) {
        Product product = new Product();
        updateProductFromDTO(product, productDTO);
        return product;
    }

    private void updateProductFromDTO(Product product, ProductDTO productDTO) {
        product.setName(productDTO.getName());
        product.setSkuCode(productDTO.getSkuCode());
        product.setSalePrice(productDTO.getSalePrice());
        product.setDiscountPrice(productDTO.getDiscountPrice());
        product.setUnitOfMeasure(productDTO.getUnitOfMeasure());
        product.setType(productDTO.getType());
        product.setCondition(productDTO.getCondition());
        product.setProductionType(productDTO.getProductionType());
        product.setExpirationDate(productDTO.getExpirationDate());
        product.setFreeShipping(productDTO.isFreeShipping());
        product.setNetWeight(productDTO.getNetWeight());
        product.setGrossWeight(productDTO.getGrossWeight());
        product.setWidth(productDTO.getWidth());
        product.setHeight(productDTO.getHeight());
        product.setDepth(productDTO.getDepth());
        product.setVolumes(productDTO.getVolumes());
        product.setItemsPerBox(productDTO.getItemsPerBox());
        product.setGtinEan(productDTO.getGtinEan());
        product.setGtinEanTax(productDTO.getGtinEanTax());
        product.setShortDescription(productDTO.getShortDescription());
        product.setComplementaryDescription(productDTO.getComplementaryDescription());
        product.setNotes(productDTO.getNotes());
        product.setStock(productDTO.getStock());
        product.setActive(productDTO.isActive());

        // Definir Catalog
        Catalog catalog = catalogRepository.findById(productDTO.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado"));
        product.setCatalog(catalog);

        // Definir Categoria
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        product.setCategory(category);

        // Definir SubCategoria
        SubCategory subCategory = subCategoryRepository.findById(productDTO.getSubCategoryId())
                .orElseThrow(() -> new RuntimeException("Subcategoria não encontrada"));
        product.setSubCategory(subCategory);

        // Definir Marca
        Brand brand = brandRepository.findById(productDTO.getBrandId())
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));
        product.setBrand(brand);

        // Tratamento de Variações se houver (Implementação omitida para brevidade)
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        // Definir campos
        productDTO.setId(product.getId());
        productDTO.setImages(product.getImages());
        productDTO.setName(product.getName());
        productDTO.setSkuCode(product.getSkuCode());
        productDTO.setSalePrice(product.getSalePrice());
        productDTO.setDiscountPrice(product.getDiscountPrice());
        productDTO.setUnitOfMeasure(product.getUnitOfMeasure());
        productDTO.setType(product.getType());
        productDTO.setCondition(product.getCondition());
        productDTO.setProductionType(product.getProductionType());
        productDTO.setExpirationDate(product.getExpirationDate());
        productDTO.setFreeShipping(product.isFreeShipping());
        productDTO.setNetWeight(product.getNetWeight());
        productDTO.setGrossWeight(product.getGrossWeight());
        productDTO.setWidth(product.getWidth());
        productDTO.setHeight(product.getHeight());
        productDTO.setDepth(product.getDepth());
        productDTO.setVolumes(product.getVolumes());
        productDTO.setItemsPerBox(product.getItemsPerBox());
        productDTO.setGtinEan(product.getGtinEan());
        productDTO.setGtinEanTax(product.getGtinEanTax());
        productDTO.setShortDescription(product.getShortDescription());
        productDTO.setComplementaryDescription(product.getComplementaryDescription());
        productDTO.setNotes(product.getNotes());
        productDTO.setStock(product.getStock());
        productDTO.setActive(product.isActive());

        productDTO.setCatalogId(product.getCatalog().getId());
        productDTO.setCategoryId(product.getCategory().getId());
        productDTO.setSubCategoryId(product.getSubCategory().getId());
        productDTO.setBrandId(product.getBrand().getId());

        // Tratamento de Variações se houver (Implementação omitida para brevidade)
        return productDTO;
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