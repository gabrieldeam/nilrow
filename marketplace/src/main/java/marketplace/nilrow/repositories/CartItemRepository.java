package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, String> { }
