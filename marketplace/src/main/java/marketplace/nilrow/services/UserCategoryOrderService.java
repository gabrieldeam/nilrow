package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.CategoryDTO;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrder;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrderDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.UserCategoryOrderRepository;
import marketplace.nilrow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserCategoryOrderService {

    @Autowired
    private UserCategoryOrderRepository userCategoryOrderRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Pega o ID do usuário autenticado
    private String getAuthenticatedUserId() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUsername();  // Isso deve retornar o username ou ID do usuário (ajuste conforme necessário)
    }

    // Obter todas as ordens de exibição de categorias para o usuário autenticado
    public List<UserCategoryOrderDTO> getUserCategoryOrder() {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        List<UserCategoryOrder> orders = userCategoryOrderRepository.findByUser(user);

        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Atualizar ordem de exibição para o usuário
    public UserCategoryOrderDTO updateUserCategoryOrder(UserCategoryOrderDTO orderDTO) {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Optional<Category> categoryOpt = categoryRepository.findById(orderDTO.getCategory().getId());
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Categoria não encontrada");
        }

        Category category = categoryOpt.get();
        Optional<UserCategoryOrder> existingOrderOpt = userCategoryOrderRepository.findById(orderDTO.getId());

        UserCategoryOrder order = existingOrderOpt.orElse(new UserCategoryOrder());
        order.setUser(user);
        order.setCategory(category);
        order.setDisplayOrder(orderDTO.getDisplayOrder());

        UserCategoryOrder savedOrder = userCategoryOrderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    // Criar nova ordem de exibição para o usuário
    public UserCategoryOrderDTO createUserCategoryOrder(UserCategoryOrderDTO orderDTO) {
        String userId = getAuthenticatedUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Category category = categoryRepository.findById(orderDTO.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        UserCategoryOrder order = new UserCategoryOrder();
        order.setUser(user);
        order.setCategory(category);
        order.setDisplayOrder(orderDTO.getDisplayOrder());

        UserCategoryOrder savedOrder = userCategoryOrderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    // Deletar uma ordem de exibição
    public void deleteUserCategoryOrder(String orderId) {
        userCategoryOrderRepository.deleteById(orderId);
    }

    // Converter para DTO
    private UserCategoryOrderDTO convertToDTO(UserCategoryOrder order) {
        CategoryDTO categoryDTO = new CategoryDTO(
                order.getCategory().getId(),
                order.getCategory().getName(),
                order.getCategory().getImageUrl()
        );

        return new UserCategoryOrderDTO(
                order.getId(),
                order.getUser().getId(),
                categoryDTO,
                order.getDisplayOrder()
        );
    }
}
