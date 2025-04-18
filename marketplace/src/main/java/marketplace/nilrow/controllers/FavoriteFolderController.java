package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.domain.favorites.FavoriteFolderDTO;
import marketplace.nilrow.domain.favorites.FavoriteStatusDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.services.FavoriteFolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
        List<FavoriteFolderDTO> folders = folderService.listFolders(people.getId(), 3);
        return ResponseEntity.ok(folders);
    }

    /* ---------- PRODUTOS DA PASTA (PAGINADO) ---------- */
    @GetMapping("/{folderName}")
    public ResponseEntity<Page<ProductDTO>> getProductsInFolder(
            @PathVariable String folderName,
            @PageableDefault(size = 12, sort = "name") Pageable pageable) {

        People people = getAuthenticatedPeople();
        Page<ProductDTO> page =
                folderService.listProductsInFolder(people.getId(), folderName, pageable);
        return ResponseEntity.ok(page);
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

    // FavoriteFolderController.java
    @GetMapping("/status")
    public ResponseEntity<FavoriteStatusDTO> getStatus(
            @RequestParam String productId) {

        People people = getAuthenticatedPeople();
        FavoriteStatusDTO dto =
                folderService.getStatusForProduct(people.getId(), productId);
        return ResponseEntity.ok(dto);
    }


}
