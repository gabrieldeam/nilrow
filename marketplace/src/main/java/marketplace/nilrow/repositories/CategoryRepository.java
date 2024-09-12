package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByNameContainingIgnoreCase(String name);
}

