package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.category.UserCategoryOrder;
import marketplace.nilrow.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCategoryOrderRepository extends JpaRepository<UserCategoryOrder, String> {
    List<UserCategoryOrder> findByUser(User user);
}

