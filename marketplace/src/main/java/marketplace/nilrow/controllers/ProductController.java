package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Operações relacionadas a produtos")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Cria um novo produto (POST) enviando o JSON do produto e as imagens do produto principal
     * via multipart/form-data.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages
    ) throws IOException {
        // Agora, apenas as imagens do produto principal serão processadas.
        ProductDTO created = productService.createProduct(productDTO, productImages);
        return ResponseEntity.ok(created);
    }

    /**
     * Atualiza um produto existente (PUT) enviando o JSON do produto e as imagens do produto principal
     * via multipart/form-data.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages
    ) throws IOException {
        ProductDTO updated = productService.updateProduct(id, productDTO, productImages);
        return ResponseEntity.ok(updated);
    }

    /**
     * Exclui um produto (e suas imagens) pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca um produto pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        ProductDTO productDTO = productService.getProductById(id);
        return ResponseEntity.ok(productDTO);
    }

    /**
     * Lista todos os produtos com paginação.
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> listAllProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductDTO> result = productService.listAllProducts(PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    /**
     * Lista produtos de um catálogo específico, com paginação.
     */
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<Page<ProductDTO>> listProductsByCatalog(
            @PathVariable String catalogId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductDTO> result = productService.listProductsByCatalog(
                catalogId,
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam("term") String term,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductDTO> result = productService.searchProducts(term, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/catalog/{catalogId}/search")
    public ResponseEntity<Page<ProductDTO>> searchProductsByCatalog(
            @PathVariable String catalogId,
            @RequestParam("term") String term,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductDTO> result = productService.searchProductsByCatalog(catalogId, term, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

}
