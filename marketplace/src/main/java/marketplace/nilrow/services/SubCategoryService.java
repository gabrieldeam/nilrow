package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.category.SubCategoryDTO;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubCategoryService {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Criar uma subcategoria associada a uma categoria
    public SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO) {
        Optional<Category> categoryOpt = categoryRepository.findById(subCategoryDTO.getCategoryId());
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Categoria não encontrada");
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setName(subCategoryDTO.getName());
        subCategory.setCategory(categoryOpt.get());

        SubCategory savedSubCategory = subCategoryRepository.save(subCategory);
        return convertToDTO(savedSubCategory);
    }

    // Atualizar subcategoria
    public SubCategoryDTO updateSubCategory(String subCategoryId, SubCategoryDTO subCategoryDTO) {
        Optional<SubCategory> subCategoryOpt = subCategoryRepository.findById(subCategoryId);
        if (subCategoryOpt.isPresent()) {
            SubCategory subCategory = subCategoryOpt.get();
            subCategory.setName(subCategoryDTO.getName());

            Optional<Category> categoryOpt = categoryRepository.findById(subCategoryDTO.getCategoryId());
            if (categoryOpt.isEmpty()) {
                throw new RuntimeException("Categoria não encontrada");
            }
            subCategory.setCategory(categoryOpt.get());

            SubCategory updatedSubCategory = subCategoryRepository.save(subCategory);
            return convertToDTO(updatedSubCategory);
        }
        return null;
    }

    // Deletar subcategoria
    public void deleteSubCategory(String subCategoryId) {
        subCategoryRepository.deleteById(subCategoryId);
    }

    // Obter todas as subcategorias de uma categoria
    public Page<SubCategoryDTO> getSubCategoriesByCategory(String categoryId, Pageable pageable) {
        Page<SubCategory> page = subCategoryRepository.findByCategoryId(categoryId, pageable);
        return page.map(this::convertToDTO);
    }

    // Obter subcategoria por ID
    public SubCategoryDTO getSubCategoryById(String subCategoryId) {
        Optional<SubCategory> subCategoryOpt = subCategoryRepository.findById(subCategoryId);
        return subCategoryOpt.map(this::convertToDTO).orElse(null);
    }

    // Converter entidade SubCategory para DTO
    private SubCategoryDTO convertToDTO(SubCategory subCategory) {
        return new SubCategoryDTO(
                subCategory.getId(),
                subCategory.getName(),
                subCategory.getCategory().getId()  // Categoria associada
        );
    }
}
