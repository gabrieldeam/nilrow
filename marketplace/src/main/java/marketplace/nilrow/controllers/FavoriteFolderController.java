package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.favorites.FavoriteFolderDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.services.FavoriteFolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/favorites")
public class FavoriteFolderController {

    @Autowired
    private FavoriteFolderService folderService;

    @Autowired
    private PeopleRepository peopleRepository;

    // Exemplo de GET que lista todas as pastas do usuário autenticado
    @GetMapping
    public ResponseEntity<List<FavoriteFolderDTO>> listAllFolders() {
        People people = getAuthenticatedPeople();
        List<FavoriteFolderDTO> folders = folderService.listFolders(people.getId());
        return ResponseEntity.ok(folders);
    }

    // Exemplo de GET que lista produtos de uma pasta específica
    @GetMapping("/{folderName}")
    public ResponseEntity<Set<String>> getProductsInFolder(@PathVariable String folderName) {
        People people = getAuthenticatedPeople();
        Set<String> productIds = folderService.listProductsInFolder(people.getId(), folderName);
        return ResponseEntity.ok(productIds);
    }

    // POST para "curtir" produto (adicionar a pasta).
    // Se folderName não vier, usará "todos".
    @PostMapping("/like")
    public ResponseEntity<Void> likeProduct(@RequestParam(required = false) String folderName,
                                            @RequestParam String productId) {
        People people = getAuthenticatedPeople();
        folderService.addProductToFolder(people.getId(), folderName, productId);
        return ResponseEntity.ok().build();
    }

    // DELETE para "descurtir"
    @DeleteMapping("/like")
    public ResponseEntity<Void> removeProductLike(@RequestParam String folderName,
                                                  @RequestParam String productId) {
        People people = getAuthenticatedPeople();
        folderService.removeProductFromFolder(people.getId(), folderName, productId);
        return ResponseEntity.noContent().build();
    }

    /**
     *  Recupera o People a partir do usuário autenticado (token no cookie).
     */
    private People getAuthenticatedPeople() {
        // Pega o principal do SecurityContext
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // Carrega o People
        return peopleRepository.findByUser(user);
    }

}
