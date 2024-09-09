package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.category.CategoryDTO;
import marketplace.nilrow.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/categories")
@Tag(name = "Catalog", description = "Operações relacionadas ao canal")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<CategoryDTO> createCategory(@RequestParam("name") String name, @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setName(name);
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO, image);
        return ResponseEntity.ok(createdCategory);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String id) {
        CategoryDTO categoryDTO = categoryService.getCategoryById(id);
        return ResponseEntity.ok(categoryDTO);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable String id, @RequestParam("name") String name, @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setName(name);
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO, image);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
