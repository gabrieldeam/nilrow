package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.product.template.ProductTemplateDTO;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.services.ProductTemplateService;
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
@RequestMapping("/product-templates")
@Tag(name = "Product Templates", description = "Operações relacionadas a templates de produtos")
public class ProductTemplateController {

    @Autowired
    private ProductTemplateService templateService;

    // Criar Template com multipart/form-data
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<ProductTemplateDTO> createTemplate(
            @RequestPart("template") ProductTemplateDTO templateDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        try {
            ProductTemplateDTO createdTemplate = templateService.createTemplate(templateDTO, images);
            return ResponseEntity.ok(createdTemplate);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Atualizar Template com multipart/form-data
    @PutMapping(value = "/edit/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ProductTemplateDTO> updateTemplate(
            @PathVariable String id,
            @RequestPart("template") ProductTemplateDTO templateDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        try {
            ProductTemplateDTO updatedTemplate = templateService.updateTemplate(id, templateDTO, images);
            return ResponseEntity.ok(updatedTemplate);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


    // Demais endpoints permanecem inalterados
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{id}")
    public ResponseEntity<ProductTemplateDTO> getTemplateById(@PathVariable String id) {
        ProductTemplateDTO templateDTO = templateService.getTemplateById(id);
        return ResponseEntity.ok(templateDTO);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductTemplateDTO>> getAllTemplates() {
        List<ProductTemplateDTO> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getProductsByTemplate(@PathVariable String id) {
        List<Product> products = templateService.getProductsByTemplate(id);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{templateId}/products-by-cep")
    public ResponseEntity<List<Product>> getProductsByTemplateAndCep(@PathVariable String templateId,
                                                                     @RequestParam String cep) {
        List<Product> products = templateService.getProductsByTemplateAndCep(templateId, cep);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{templateId}/products-by-cep-and-hours")
    public ResponseEntity<List<Product>> getProductsByTemplateAndCepAndHours(
            @PathVariable String templateId,
            @RequestParam String cep) {
        List<Product> products = templateService.getProductsByTemplateAndCepAndOperatingHours(templateId, cep);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductTemplateDTO>> searchTemplates(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductTemplateDTO> result = templateService.searchTemplatesByName(name, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-with-filters")
    public ResponseEntity<Page<ProductTemplateDTO>> searchTemplatesWithFilters(
            @RequestParam String name,
            @RequestParam(required = false) String cep,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductTemplateDTO> result = templateService.searchTemplatesByNameWithFilters(name, cep, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{templateId}/products-by-filters")
    public ResponseEntity<Page<Product>> getProductsByTemplateAndFilters(
            @PathVariable String templateId,
            @RequestParam String cep,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String subCategoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = templateService.getProductsByTemplateAndFilters(templateId, cep, categoryId, subCategoryId, pageable);
        return ResponseEntity.ok(result);
    }
}
