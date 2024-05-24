package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import marketplace.nilrow.domain.product.PartialRequestProductDTO;
import marketplace.nilrow.domain.product.Product;
import marketplace.nilrow.repositories.ProductRepository;
import marketplace.nilrow.domain.product.RequestProductDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/product")
@Tag(name = "Admin")
public class ProductController {

	@Autowired
	private ProductRepository repository;

	@GetMapping
	public ResponseEntity<List<Product>> getAllProducts() {
		var allProducts = repository.findAllByActiveTrue();
		return ResponseEntity.ok(allProducts);
	}

	@PostMapping
	public ResponseEntity<List<Product>> registerProduct(@RequestBody @Valid RequestProductDTO data){
		Product newProduct = new Product(data);
		repository.save(newProduct);
		return ResponseEntity.ok().build();
	}

	@PutMapping("/{id}")
	@Transactional
	public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody @Valid PartialRequestProductDTO data) {
		Optional<Product> optionalProduct = repository.findById(id);
		if (optionalProduct.isPresent()) {
			Product product = optionalProduct.get();

			if (data.name() != null) {
				product.setName(data.name());
			}
			if (data.price_in_cents() != null) {
				product.setPrice_in_cents(data.price_in_cents());
			}

			return ResponseEntity.ok(repository.save(product));
		} else {
			throw new EntityNotFoundException();
		}
	}

	@DeleteMapping("/{id}/deactivate")
	@Transactional
	public ResponseEntity<Product> deactivateProduct(@PathVariable String id){
		Optional<Product> optionalProduct = repository.findById(id);
		if (optionalProduct.isPresent()) {
			Product product = optionalProduct.get();
			product.setActive(false);
			return ResponseEntity.noContent().build();
		} else {
			throw new EntityNotFoundException();
		}
	}

	@DeleteMapping("/{id}/delete")
	@Transactional
	public ResponseEntity<Void> deleteProduct(@PathVariable String id){
		Optional<Product> optionalProduct = repository.findById(id);
		if (optionalProduct.isPresent()) {
			Product product = optionalProduct.get();
			repository.delete(product);
			return ResponseEntity.noContent().build();
		} else {
			throw new EntityNotFoundException();
		}
	}

}
