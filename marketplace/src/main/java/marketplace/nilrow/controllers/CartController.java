package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.cart.CartDTO;
import marketplace.nilrow.domain.cart.CartItemRequest;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.services.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final PeopleRepository peopleRepo;

    public CartController(CartService cartService,
                          PeopleRepository peopleRepo) {
        this.cartService = cartService;
        this.peopleRepo  = peopleRepo;
    }

    /* ------------ helper para extrair People do token ------------ */
    private People getAuthenticatedPeople() {
        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return peopleRepo.findByUser(user);
    }

    /* ------------ adicionar OU atualizar item ------------- */
    @PostMapping("/items")
    public ResponseEntity<CartDTO> addOrUpdateItem(
            @RequestBody CartItemRequest body) {

        People people = getAuthenticatedPeople();
        CartDTO dto = cartService.addOrUpdateItem(people.getId(), body);
        return ResponseEntity.ok(dto);
    }

    /* ------------ obter carrinho completo ----------------- */
    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        CartDTO dto = cartService.getCart(getAuthenticatedPeople().getId());
        return ResponseEntity.ok(dto);
    }
}
