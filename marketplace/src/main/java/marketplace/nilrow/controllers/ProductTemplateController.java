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

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/product-templates")
@Tag(name = "Product Templates", description = "Operações relacionadas a templates de produtos")
public class ProductTemplateController {

    @Autowired
    private ProductTemplateService templateService;

    // Criar Template
    @PostMapping("/create")
    public ResponseEntity<ProductTemplateDTO> createTemplate(@RequestBody ProductTemplateDTO templateDTO) {
        try {
            ProductTemplateDTO createdTemplate = templateService.createTemplate(templateDTO);
            return ResponseEntity.ok(createdTemplate);
        } catch (IOException e) {
            // Você pode logar o erro e retornar um status 500, por exemplo.
            return ResponseEntity.status(500).build();
        }
    }


    // Atualizar Template
    @PutMapping("/edit/{id}")
    public ResponseEntity<ProductTemplateDTO> updateTemplate(@PathVariable String id,
                                                             @RequestBody ProductTemplateDTO templateDTO) {
        try {
            ProductTemplateDTO updatedTemplate = templateService.updateTemplate(id, templateDTO);
            return ResponseEntity.ok(updatedTemplate);
        } catch (IOException e) {
            // Aqui você pode logar o erro e retornar uma resposta apropriada
            return ResponseEntity.status(500).body(null);
        }
    }


    // Deletar Template
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        // Implementar a deleção se necessário
        // templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    // Buscar Template por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductTemplateDTO> getTemplateById(@PathVariable String id) {
        ProductTemplateDTO templateDTO = templateService.getTemplateById(id);
        return ResponseEntity.ok(templateDTO);
    }

    // Listar todos os Templates
    @GetMapping("/all")
    public ResponseEntity<List<ProductTemplateDTO>> getAllTemplates() {
        List<ProductTemplateDTO> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    // Exemplo: Listar produtos associados a um template
    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getProductsByTemplate(@PathVariable String id) {
        List<Product> products = templateService.getProductsByTemplate(id);
        return ResponseEntity.ok(products);
    }

    // Novo endpoint: filtrar produtos do template pelo CEP
    @GetMapping("/{templateId}/products-by-cep")
    public ResponseEntity<List<Product>> getProductsByTemplateAndCep(@PathVariable String templateId,
                                                                     @RequestParam String cep) {
        List<Product> products = templateService.getProductsByTemplateAndCep(templateId, cep);
        return ResponseEntity.ok(products);
    }

    // Novo endpoint: filtrar produtos do template pelo CEP e horário de funcionamento
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
