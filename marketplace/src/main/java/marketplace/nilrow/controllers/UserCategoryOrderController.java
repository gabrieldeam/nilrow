package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrderDTO;
import marketplace.nilrow.services.UserCategoryOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

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

    // Novo Endpoint Upsert: Cria ou Atualiza a ordem de exibição
    @PutMapping("/upsert")
    public ResponseEntity<List<UserCategoryOrderDTO>> upsertUserCategoryOrder(@RequestBody List<UserCategoryOrderDTO> orderDTOList) {
        List<UserCategoryOrderDTO> upsertedOrders = orderDTOList.stream()
                .map(userCategoryOrderService::upsertUserCategoryOrder)
                .collect(Collectors.toList());
        return ResponseEntity.ok(upsertedOrders);
    }



}
