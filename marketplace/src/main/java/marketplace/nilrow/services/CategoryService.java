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
import java.nio.file.Path;
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

    // Criar categoria com upload de imagem
    public CategoryDTO createCategory(CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Category category = new Category();
        category.setName(categoryDTO.getName());

        // Upload da imagem, se presente
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            category.setImageUrl(imagePath);
        } else {
            category.setImageUrl(DEFAULT_IMAGE);  // Imagem padrão
        }

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    // Atualizar categoria e imagem
    public CategoryDTO updateCategory(String categoryId, CategoryDTO categoryDTO, MultipartFile image) throws IOException {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            category.setName(categoryDTO.getName());

            // Se a imagem enviada não for nula, excluir a antiga (se não for a padrão) e salvar a nova
            if (image != null && !image.isEmpty()) {
                if (!category.getImageUrl().equals(DEFAULT_IMAGE)) {
                    deleteImage(category.getImageUrl());
                }
                String newImagePath = saveImage(image);
                category.setImageUrl(newImagePath);
            }

            Category updatedCategory = categoryRepository.save(category);
            return convertToDTO(updatedCategory);
        }
        return null;
    }

    // Deletar categoria e remover imagem associada
    public void deleteCategory(String categoryId) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            if (!category.getImageUrl().equals(DEFAULT_IMAGE)) {
                deleteImage(category.getImageUrl());
            }
            categoryRepository.delete(category);
        }
    }

    // Obter todas as categorias
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Obter categoria por ID
    public CategoryDTO getCategoryById(String categoryId) {
        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        return categoryOpt.map(this::convertToDTO).orElse(null);
    }

    // Métodos auxiliares

    // Converter entidade Category para DTO
    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getImageUrl()
        );
    }

    // Salvar imagem no diretório e retornar o caminho relativo
    private String saveImage(MultipartFile image) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();  // Nome único para evitar conflitos
        String filePath = UPLOAD_DIR + uniqueFileName;
        Path path = Paths.get(filePath);
        Files.write(path, image.getBytes());

        return "/uploads/" + uniqueFileName;  // Retorna apenas o caminho relativo
    }

    // Excluir imagem do sistema de arquivos
    private void deleteImage(String imageUrl) {
        String absoluteImagePath = System.getProperty("user.dir") + imageUrl;  // Resolve o caminho absoluto
        Path path = Paths.get(absoluteImagePath);
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
