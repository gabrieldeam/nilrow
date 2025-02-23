package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.category.SubCategoryDTO;
import marketplace.nilrow.services.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subcategory")
@Tag(name = "Category", description = "Operações relacionadas a categorias")
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    // Criar subcategoria
    @PostMapping("/create")
    public ResponseEntity<SubCategoryDTO> createSubCategory(@RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO createdSubCategory = subCategoryService.createSubCategory(subCategoryDTO);
        return ResponseEntity.ok(createdSubCategory);
    }

    // Atualizar subcategoria
    @PutMapping("/edit/{id}")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(@PathVariable String id, @RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO updatedSubCategory = subCategoryService.updateSubCategory(id, subCategoryDTO);
        if (updatedSubCategory == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedSubCategory);
    }

    // Deletar subcategoria
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable String id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.ok().build();
    }

    // Obter todas as subcategorias de uma categoria
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<SubCategoryDTO>> getSubCategoriesByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SubCategoryDTO> subCategories = subCategoryService.getSubCategoriesByCategory(categoryId, pageable);
        return ResponseEntity.ok(subCategories);
    }

    // Obter subcategoria por ID
    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable String id) {
        SubCategoryDTO subCategory = subCategoryService.getSubCategoryById(id);
        if (subCategory == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subCategory);
    }
}
