package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
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
     * Criar um novo produto completo (incluindo variações e especificações),
     * recebendo as imagens do produto principal e das variações via FormData.
     *
     * Exemplo de envio no Front-end (FormData):
     * - productImages[]: arquivos do produto principal
     * - variationImages[0][], variationImages[1][], etc., para cada variação
     *
     * @param productDTO Dados do produto
     * @param productImages Imagens do produto principal (multipart)
     * @param variationImages Mapa de índices da variação -> lista de imagens (multipart)
     * @return ResponseEntity com o ProductDTO criado
     */
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @ModelAttribute @Valid ProductDTO productDTO,
            @RequestParam(value = "productImages", required = false) List<MultipartFile> productImages,
            @RequestParam(required = false) Map<String, List<MultipartFile>> variationImages // ex.: variationImages[0]
    ) throws IOException {

        // Aqui precisamos transformar o map "variationImages" para Map<Integer, List<MultipartFile>>
        // extraindo o índice de cada chave "variationImages[X]"
        Map<Integer, List<MultipartFile>> varImagesMap = parseVariationImages(variationImages);

        ProductDTO created = productService.createProduct(productDTO, productImages, varImagesMap);
        return ResponseEntity.ok(created);
    }

    /**
     * Atualiza um produto existente, substituindo imagens, especificações e variações.
     *
     * @param id Identificador do produto
     * @param productDTO Dados do produto
     * @param productImages Novas imagens do produto principal
     * @param variationImages Novas imagens para cada variação
     * @return ProductDTO atualizado
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable String id,
            @ModelAttribute @Valid ProductDTO productDTO,
            @RequestParam(value = "productImages", required = false) List<MultipartFile> productImages,
            @RequestParam(required = false) Map<String, List<MultipartFile>> variationImages
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

    // -----------------------------------------------------
    // Método auxiliar para parsear variationImages
    // -----------------------------------------------------
    private Map<Integer, List<MultipartFile>> parseVariationImages(Map<String, List<MultipartFile>> variationImages) {
        Map<Integer, List<MultipartFile>> varImagesMap = new HashMap<>();
        if (variationImages != null) {
            // Exemplo de chave: "variationImages[0]" => precisamos extrair o índice 0
            for (String key : variationImages.keySet()) {
                if (key.startsWith("variationImages[")) {
                    int index = extractIndexFromKey(key);
                    varImagesMap.put(index, variationImages.get(key));
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
