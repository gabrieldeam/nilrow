package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.SubCategory;
import marketplace.nilrow.domain.catalog.category.SubCategoryDTO;
import marketplace.nilrow.repositories.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubCategoryService {

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    public SubCategoryDTO createSubCategory(SubCategoryDTO subCategoryDTO) {
        SubCategory subCategory = new SubCategory();
        subCategory.setName(subCategoryDTO.getName());
        SubCategory savedSubCategory = subCategoryRepository.save(subCategory);
        return convertToDTO(savedSubCategory);
    }

    public SubCategoryDTO updateSubCategory(String subCategoryId, SubCategoryDTO subCategoryDTO) {
        Optional<SubCategory> subCategoryOpt = subCategoryRepository.findById(subCategoryId);
        if (subCategoryOpt.isPresent()) {
            SubCategory subCategory = subCategoryOpt.get();
            subCategory.setName(subCategoryDTO.getName());
            SubCategory updatedSubCategory = subCategoryRepository.save(subCategory);
            return convertToDTO(updatedSubCategory);
        }
        return null;
    }

    public void deleteSubCategory(String subCategoryId) {
        subCategoryRepository.deleteById(subCategoryId);
    }

    public List<SubCategoryDTO> getAllSubCategories() {
        return subCategoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SubCategoryDTO getSubCategoryById(String subCategoryId) {
        Optional<SubCategory> subCategoryOpt = subCategoryRepository.findById(subCategoryId);
        return subCategoryOpt.map(this::convertToDTO).orElse(null);
    }

    private SubCategoryDTO convertToDTO(SubCategory subCategory) {
        return new SubCategoryDTO(subCategory.getId(), subCategory.getName());
    }
}
