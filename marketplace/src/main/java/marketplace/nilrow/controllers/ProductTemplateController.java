package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateDTO;
import marketplace.nilrow.services.ProductTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products_templates")
@Tag(name = "Products Template", description = "Operações relacionadas aos templates de produto")
public class ProductTemplateController {

    @Autowired
    private ProductTemplateService productTemplateService;

    /**
     * Cria um novo template, enviando JSON e imagens via multipart/form-data.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductTemplateDTO> createProductTemplate(
            @RequestPart("product") @Valid ProductTemplateDTO dto,
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages
    ) throws IOException {
        ProductTemplateDTO created =
                productTemplateService.createProductTemplate(dto, productImages);
        return ResponseEntity.ok(created);
    }

    /**
     * Atualiza um template existente (PUT).
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductTemplateDTO> updateProductTemplate(
            @PathVariable String id,
            @RequestPart("product") @Valid ProductTemplateDTO dto,
            @RequestPart(value = "productImages", required = false) List<MultipartFile> productImages
    ) throws IOException {
        ProductTemplateDTO updated =
                productTemplateService.updateProductTemplate(id, dto, productImages);
        return ResponseEntity.ok(updated);
    }

    /**
     * Exclui um template pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductTemplate(@PathVariable String id) {
        productTemplateService.deleteProductTemplate(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca um template pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductTemplateDTO> getProductTemplate(@PathVariable String id) {
        ProductTemplateDTO dto = productTemplateService.getProductTemplateById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Lista todos os templates com paginação.
     */
    @GetMapping
    public ResponseEntity<Page<ProductTemplateDTO>> listAllTemplates(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductTemplateDTO> result =
                productTemplateService.listAllProductTemplates(PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    /**
     * Busca templates via "search" (nome ou skuCode).
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductTemplateDTO>> searchTemplates(
            @RequestParam("term") String term,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<ProductTemplateDTO> result =
                productTemplateService.searchProductTemplates(term, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }
}
