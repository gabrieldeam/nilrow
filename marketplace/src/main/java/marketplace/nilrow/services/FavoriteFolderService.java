package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.catalog.product.ProductDTO;
import marketplace.nilrow.domain.favorites.FavoriteFolder;
import marketplace.nilrow.domain.favorites.FavoriteFolderDTO;
import marketplace.nilrow.domain.favorites.FavoriteStatusDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.FavoriteFolderRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import marketplace.nilrow.repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
        return listFolders(peopleId, 3);
    }

    @Transactional(readOnly = true)
    public List<FavoriteFolderDTO> listFolders(String peopleId, int productLimit) {
        return folderRepository.findByPeopleId(peopleId)
                .stream()
                .map(f -> toDTO(f, productLimit))
                .collect(Collectors.toList());
    }

    /* ---------- PRODUTOS DA PASTA – PAGINADO ---------- */
    @Transactional(readOnly = true)
    public Page<ProductDTO> listProductsInFolder(String peopleId,
                                                 String folderName,
                                                 Pageable pageable) {

        FavoriteFolder folder = folderRepository.findByPeopleIdAndName(peopleId, folderName)
                .orElseThrow(() -> new RuntimeException("Pasta não encontrada"));

        List<ProductDTO> all = folder.getProducts().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), all.size());

        List<ProductDTO> pageContent = (start >= end) ? Collections.emptyList()
                : all.subList(start, end);

        return new PageImpl<>(pageContent, pageable, all.size());
    }


    @Transactional(readOnly = true)
    public FavoriteStatusDTO getStatusForProduct(String peopleId, String productId) {

        // todas as pastas do usuário que contenham o produto
        List<String> folderNames = folderRepository
                .findByPeopleId(peopleId).stream()
                .filter(f -> f.getProducts().stream()
                        .anyMatch(p -> p.getId().equals(productId)))
                .map(FavoriteFolder::getName)
                .toList();

        return new FavoriteStatusDTO(!folderNames.isEmpty(), folderNames);
    }

    private FavoriteFolderDTO toDTO(FavoriteFolder folder, int limit) {
        List<ProductDTO> preview = folder.getProducts().stream()
                .limit(limit)
                .map(ProductDTO::fromEntity)

                .collect(Collectors.toList());

        FavoriteFolderDTO dto = new FavoriteFolderDTO();
        dto.setId(folder.getId());
        dto.setName(folder.getName());
        dto.setProductsPreview(preview);
        return dto;
    }
}