package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
// Outros imports necessários

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Operações relacionadas a produtos")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Criar Produto
    @PostMapping("/create")
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        ProductDTO createdProduct = productService.createProduct(productDTO, images);
        return ResponseEntity.ok(createdProduct);
    }

    // Atualizar Produto
    @PutMapping("/edit/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        ProductDTO updatedProduct = productService.updateProduct(id, productDTO, images);
        return ResponseEntity.ok(updatedProduct);
    }

    // Deletar Produto
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // Obter Produto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        ProductDTO productDTO = productService.getProductById(id);
        return ResponseEntity.ok(productDTO);
    }

    // Obter Produtos por Catálogo
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<ProductDTO>> getProductsByCatalog(@PathVariable String catalogId) {
        List<ProductDTO> products = productService.getProductsByCatalog(catalogId);
        return ResponseEntity.ok(products);
    }
}
