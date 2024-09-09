package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.CategoryDTO;
import marketplace.nilrow.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";
    private static final String DEFAULT_IMAGE = "/uploads/25990a43-5546-4b25-aa4d-67da7de149af_defaultImage.png";

    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryDTO createCategory(CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Category category = new Category();
        category.setName(categoryDTO.getName());

        if (image == null || image.isEmpty()) {
            category.setImageUrl(DEFAULT_IMAGE);
        } else {
            if (!Files.exists(Paths.get(UPLOAD_DIR))) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            }
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filepath = Paths.get(UPLOAD_DIR, filename).toString();

            image.transferTo(new File(filepath));
            category.setImageUrl("/uploads/" + filename);
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public CategoryDTO getCategoryById(String id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Categoria não encontrada");
        }
        return convertToDTO(categoryOpt.get());
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO updateCategory(String id, CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        // Excluir a imagem antiga se houver uma nova
        if (image != null && !image.isEmpty()) {
            if (category.getImageUrl() != null && !category.getImageUrl().equals(DEFAULT_IMAGE)) {
                deleteImage(category.getImageUrl());
            }

            if (!Files.exists(Paths.get(UPLOAD_DIR))) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            }
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            String filepath = Paths.get(UPLOAD_DIR, filename).toString();

            image.transferTo(new File(filepath));
            category.setImageUrl("/uploads/" + filename);
        }

        category.setName(categoryDTO.getName());
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }


    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        // Excluir a imagem ao deletar a categoria
        if (category.getImageUrl() != null && !category.getImageUrl().equals(DEFAULT_IMAGE)) {
            deleteImage(category.getImageUrl());
        }

        categoryRepository.deleteById(id);
    }

    private void deleteImage(String imageUrl) {
        String filePath = System.getProperty("user.dir") + imageUrl;
        File file = new File(filePath);
        if (file.exists()) {
            file.delete();
        }
    }

    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getImageUrl(), null);  // Assumindo que as subcategorias serão gerenciadas separadamente
    }
}
