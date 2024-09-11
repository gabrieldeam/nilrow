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
@Tag(name = "Category", description = "Operações relacionadas a categorias")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<CategoryDTO> createCategory(@RequestPart("category") CategoryDTO categoryDTO,
                                                      @RequestPart("image") MultipartFile image) throws IOException {
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO, image);
        return ResponseEntity.ok(createdCategory);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable String id,
                                                      @RequestPart("category") CategoryDTO categoryDTO,
                                                      @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO, image);
        return updatedCategory != null ? ResponseEntity.ok(updatedCategory) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        return category != null ? ResponseEntity.ok(category) : ResponseEntity.notFound().build();
    }
}