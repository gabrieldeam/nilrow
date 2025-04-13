package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.favorites.FavoriteFolder;
import marketplace.nilrow.domain.favorites.FavoriteFolderDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.FavoriteFolderRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FavoriteFolderService {

    private final FavoriteFolderRepository folderRepository;
    private final ProductRepository productRepository;
    private final PeopleRepository peopleRepository;

    public FavoriteFolderService(FavoriteFolderRepository folderRepository,
                                 ProductRepository productRepository,
                                 PeopleRepository peopleRepository) {
        this.folderRepository = folderRepository;
        this.productRepository = productRepository;
        this.peopleRepository = peopleRepository;
    }

    /**
     * Cria ou retorna pasta "todos" se não existir para o user,
     * OU pasta com o nome informado.
     */
    @Transactional
    public FavoriteFolder createOrGetFolder(String peopleId, String folderName) {
        if (folderName == null || folderName.trim().isEmpty()) {
            folderName = "todos";
        }
        // Verifica se o People existe
        People people = peopleRepository.findById(peopleId)
                .orElseThrow(() -> new RuntimeException("Usuário (People) não encontrado"));

        // Verifica se a pasta já existe
        Optional<FavoriteFolder> folderOpt = folderRepository.findByPeopleIdAndName(peopleId, folderName);
        if (folderOpt.isPresent()) {
            return folderOpt.get();
        }

        // Se não existir, cria
        FavoriteFolder newFolder = new FavoriteFolder();
        newFolder.setName(folderName);
        newFolder.setPeople(people);
        return folderRepository.save(newFolder);
    }

    /**
     * Adicionar um produto em uma pasta de curtidas.
     */
    @Transactional
    public void addProductToFolder(String peopleId, String folderName, String productId) {
        // Cria ou obtém a pasta
        FavoriteFolder folder = createOrGetFolder(peopleId, folderName);

        // Busca o produto
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Adiciona ao Set
        folder.getProducts().add(product);
        folderRepository.save(folder); // atualiza
    }

    /**
     * Remove um produto da pasta.
     */
    @Transactional
    public void removeProductFromFolder(String peopleId, String folderName, String productId) {
        FavoriteFolder folder = folderRepository.findByPeopleIdAndName(peopleId, folderName)
                .orElseThrow(() -> new RuntimeException("Pasta não encontrada para este usuário"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        folder.getProducts().remove(product);
        folderRepository.save(folder);
    }

    /**
     * Lista as pastas de um usuário (People).
     */
    @Transactional(readOnly = true)
    public List<FavoriteFolderDTO> listFolders(String peopleId) {
        List<FavoriteFolder> folders = folderRepository.findByPeopleId(peopleId);
        return folders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista os produtos de uma determinada pasta.
     */
    @Transactional(readOnly = true)
    public Set<String> listProductsInFolder(String peopleId, String folderName) {
        FavoriteFolder folder = folderRepository.findByPeopleIdAndName(peopleId, folderName)
                .orElseThrow(() -> new RuntimeException("Pasta não encontrada para este usuário"));

        return folder.getProducts().stream()
                .map(Product::getId)
                .collect(Collectors.toSet());
    }

    // conversor simples
    private FavoriteFolderDTO convertToDTO(FavoriteFolder folder) {
        FavoriteFolderDTO dto = new FavoriteFolderDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setPeopleId(folder.getPeople().getId());
        // converte produtos pra lista de IDs
        Set<String> productIds = folder.getProducts().stream()
                .map(Product::getId)
                .collect(Collectors.toSet());
        dto.setProductIds(productIds);
        return dto;
    }
}