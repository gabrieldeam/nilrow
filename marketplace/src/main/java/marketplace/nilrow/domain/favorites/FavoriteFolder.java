package marketplace.nilrow.domain.favorites;

import jakarta.persistence.*;
import lombok.*;
import marketplace.nilrow.domain.catalog.product.Product;
import marketplace.nilrow.domain.people.People;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "favorite_folders")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class FavoriteFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name; // Ex: "todos", "roupas", "eletrônicos"...

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "people_id", nullable = false)
    private People people;

    // Muitos-para-muitos com Product.
    // Tabela de junção: favorite_folder_products
    @ManyToMany
    @JoinTable(
            name = "favorite_folder_products",
            joinColumns = @JoinColumn(name = "folder_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> products = new HashSet<>();
}