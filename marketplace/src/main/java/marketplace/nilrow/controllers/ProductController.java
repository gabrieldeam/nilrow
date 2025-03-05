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

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            // Em vez de @ModelAttribute, use @RequestPart("product")
            @RequestPart("product") @Valid ProductDTO productDTO,
            // As imagens do produto principal podem ser @RequestPart ou @RequestParam,
            // mas se quisermos manter a coerência e enviar tudo como multipart:
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages,
            // Mapa de variações -> imagens
            @RequestPart(required = false) Map<String, List<MultipartFile>> variationImages
    ) throws IOException {

        // Precisamos converter "variationImages" para Map<Integer, List<MultipartFile>>:
        Map<Integer, List<MultipartFile>> varImagesMap = parseVariationImages(variationImages);

        ProductDTO created = productService.createProduct(productDTO, productImages, varImagesMap);
        return ResponseEntity.ok(created);
    }

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @RequestPart("product") @Valid ProductDTO productDTO,
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages,
            @RequestPart(required = false) Map<String, List<MultipartFile>> variationImages
    ) throws IOException {
        Map<Integer, List<MultipartFile>> varImagesMap = parseVariationImages(variationImages);
        ProductDTO updated = productService.updateProduct(id, productDTO, productImages, varImagesMap);
        return ResponseEntity.ok(updated);
    }


    /**
     * Exclui um produto pelo ID.
     *
     * @param id ID do produto
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca um produto pelo ID.
     *
     * @param id ID do produto
     * @return ProductDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        ProductDTO productDTO = productService.getProductById(id);
        return ResponseEntity.ok(productDTO);
    }

    /**
     * Lista todos os produtos com paginação.
     * Exemplo de uso: GET /products?page=0&size=10
     *
     * @param page Número da página (default = 0)
     * @param size Tamanho da página (default = 10)
     * @return Page de ProductDTO
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
     * Exemplo de uso: GET /products/catalog/{catalogId}?page=0&size=10
     *
     * @param catalogId ID do catálogo
     * @param page Número da página (default = 0)
     * @param size Tamanho da página (default = 10)
     * @return Page de ProductDTO
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

    private Map<Integer, List<MultipartFile>> parseVariationImages(Map<String, List<MultipartFile>> variationImages) {
        Map<Integer, List<MultipartFile>> varImagesMap = new HashMap<>();
        if (variationImages != null) {
            for (String key : variationImages.keySet()) {
                if (key.startsWith("variationImages")) {
                    int index = Integer.parseInt(key.replace("variationImages", ""));
                    List<MultipartFile> files = variationImages.get(key);
                    System.out.println("Chave recebida: " + key + " -> índice: " + index + ", número de arquivos: " + (files != null ? files.size() : 0));
                    varImagesMap.put(index, files);
                }
            }
        }
        return varImagesMap;
    }




    private int extractIndexFromKey(String key) {
        // "variationImages[2]" => extraímos 2
        int start = key.indexOf('[') + 1;
        int end = key.indexOf(']');
        return Integer.parseInt(key.substring(start, end));
    }
}
