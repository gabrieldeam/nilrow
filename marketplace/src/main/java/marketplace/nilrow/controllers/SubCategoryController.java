package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.category.SubCategoryDTO;
import marketplace.nilrow.services.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subcategory")
@Tag(name = "Category", description = "Operações relacionadas a categorias")
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    @PostMapping("/create")
    public ResponseEntity<SubCategoryDTO> createSubCategory(@RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO createdSubCategory = subCategoryService.createSubCategory(subCategoryDTO);
        return ResponseEntity.ok(createdSubCategory);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(@PathVariable String id,
                                                            @RequestBody SubCategoryDTO subCategoryDTO) {
        SubCategoryDTO updatedSubCategory = subCategoryService.updateSubCategory(id, subCategoryDTO);
        return updatedSubCategory != null ? ResponseEntity.ok(updatedSubCategory) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable String id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        List<SubCategoryDTO> subCategories = subCategoryService.getAllSubCategories();
        return ResponseEntity.ok(subCategories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> getSubCategoryById(@PathVariable String id) {
        SubCategoryDTO subCategory = subCategoryService.getSubCategoryById(id);
        return subCategory != null ? ResponseEntity.ok(subCategory) : ResponseEntity.notFound().build();
    }
}
