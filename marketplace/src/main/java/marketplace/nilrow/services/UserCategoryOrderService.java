package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.category.Category;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrder;
import marketplace.nilrow.domain.catalog.category.UserCategoryOrderDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.CategoryRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.UserCategoryOrderRepository;
import marketplace.nilrow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private PeopleRepository peopleRepository;

    @Autowired
    private UserRepository userRepository;

    // Pega o usuário autenticado e, em seguida, encontra o People associado
    private People getAuthenticatedPeople() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;

        People people = peopleRepository.findByUser(user);

        if (people == null) {
            throw new RuntimeException("Pessoa não encontrada para o usuário autenticado");
        }

        return people;
    }


    // Obter todas as ordens de exibição de categorias para o usuário autenticado
    public List<UserCategoryOrderDTO> getUserCategoryOrder() {
        People people = getAuthenticatedPeople();
        List<UserCategoryOrder> orders = userCategoryOrderRepository.findByPeople(people);

        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Novo Método Upsert: Cria ou Atualiza a ordem de exibição
    @Transactional
    public UserCategoryOrderDTO upsertUserCategoryOrder(UserCategoryOrderDTO orderDTO) {
        People people = getAuthenticatedPeople();

        Category category = categoryRepository.findById(orderDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        UserCategoryOrder order;

        // Verifica se já existe uma ordem com a mesma combinação de People e Category
        Optional<UserCategoryOrder> existingOrderOpt = userCategoryOrderRepository.findByPeopleAndCategory(people, category);

        if (existingOrderOpt.isPresent()) {
            order = existingOrderOpt.get();
        } else if (orderDTO.getId() != null && !orderDTO.getId().isEmpty()) {
            // Se não foi encontrada uma ordem pela combinação, tenta encontrar a ordem pelo ID
            order = userCategoryOrderRepository.findById(orderDTO.getId())
                    .orElse(new UserCategoryOrder());
            order.setPeople(people);
            order.setCategory(category);
        } else {
            // Se nenhuma ordem foi encontrada pela combinação ou pelo ID, cria uma nova
            order = new UserCategoryOrder();
            order.setPeople(people);
            order.setCategory(category);
        }

        // Atualiza os campos
        order.setDisplayOrder(orderDTO.getDisplayOrder());

        // Salva a ordem
        UserCategoryOrder savedOrder = userCategoryOrderRepository.save(order);
        return convertToDTO(savedOrder);
    }


    // Converter para DTO
    private UserCategoryOrderDTO convertToDTO(UserCategoryOrder order) {
        return new UserCategoryOrderDTO(
                order.getId(),
                order.getCategory().getId(),  // Retorna o ID da categoria
                order.getDisplayOrder()
        );
    }
}

