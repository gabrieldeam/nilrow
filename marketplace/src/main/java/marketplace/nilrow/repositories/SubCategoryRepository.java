package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.SubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
    Page<SubCategory> findByCategoryId(String categoryId, Pageable pageable);

}
