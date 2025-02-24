package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Operações relacionadas a produtos")
public class ProductController {

    @Autowired
    private ProductService productService;

    // CREATE (multipart/form-data)
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            ProductDTO created = productService.createProduct(productDTO, images);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // UPDATE (multipart/form-data)
    @PutMapping(value = "/edit/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            ProductDTO updated = productService.updateProduct(id, productDTO, images);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        ProductDTO dto = productService.getProductById(id);
        return ResponseEntity.ok(dto);
    }

    // GET ALL
    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> dtos = productService.getAllProducts();
        return ResponseEntity.ok(dtos);
    }

    // GET PRODUCTS BY CATALOG
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<ProductDTO>> getProductsByCatalog(@PathVariable String catalogId) {
        List<ProductDTO> products = productService.getProductsByCatalog(catalogId);
        return ResponseEntity.ok(products);
    }

    // SEARCH PRODUCTS (sem template) filtrando CEP + nome
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam String cep,
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productService.searchProductsByCepAndNameAndNoTemplate(cep, name, pageable);
        return ResponseEntity.ok(result);
    }

    // LIST PRODUCTS (sem template) por CEP (paginado)
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> searchProductsByCep(
            @RequestParam String cep,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productService.getProductsByCepAndNoTemplatePaginated(cep, pageable);
        return ResponseEntity.ok(result);
    }

    // FILTRA (sem template) por CEP, categoria, subcategoria
    @GetMapping("/products-by-filters")
    public ResponseEntity<Page<Product>> searchProductsByFilters(
            @RequestParam String cep,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subCategoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productService.getProductsByCepCategoryAndNoTemplate(cep, categoryId, subCategoryId, pageable);
        return ResponseEntity.ok(result);
    }
}
