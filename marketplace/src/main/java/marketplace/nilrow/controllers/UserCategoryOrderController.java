package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrderDTO;
import marketplace.nilrow.services.UserCategoryOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-category-order")
@Tag(name = "Category", description = "Operações relacionadas a categorias")
public class UserCategoryOrderController {

    @Autowired
    private UserCategoryOrderService userCategoryOrderService;

    // Obter todas as ordens de exibição de categorias do usuário autenticado
    @GetMapping("/all")
    public ResponseEntity<List<UserCategoryOrderDTO>> getAllUserCategoryOrders() {
        List<UserCategoryOrderDTO> orders = userCategoryOrderService.getUserCategoryOrder();
        return ResponseEntity.ok(orders);
    }

    // Criar uma nova ordem de exibição
    @PostMapping("/create")
    public ResponseEntity<UserCategoryOrderDTO> createUserCategoryOrder(@RequestBody UserCategoryOrderDTO orderDTO) {
        UserCategoryOrderDTO createdOrder = userCategoryOrderService.createUserCategoryOrder(orderDTO);
        return ResponseEntity.ok(createdOrder);
    }

    // Atualizar uma ordem de exibição
    @PutMapping("/update/{id}")
    public ResponseEntity<UserCategoryOrderDTO> updateUserCategoryOrder(
            @PathVariable String id, @RequestBody UserCategoryOrderDTO orderDTO) {
        orderDTO.setId(id);
        UserCategoryOrderDTO updatedOrder = userCategoryOrderService.updateUserCategoryOrder(orderDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    // Deletar uma ordem de exibição
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUserCategoryOrder(@PathVariable String id) {
        userCategoryOrderService.deleteUserCategoryOrder(id);
        return ResponseEntity.ok().build();
    }
}
