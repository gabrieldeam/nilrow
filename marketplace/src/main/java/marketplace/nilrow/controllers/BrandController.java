package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.product.brand.BrandDTO;
import marketplace.nilrow.services.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/brands")
@Tag(name = "Products", description = "Operações relacionadas a produtos")
public class BrandController {

    @Autowired
    private BrandService brandService;

    // Criar Marca
    @PostMapping("/create")
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandDTO) {
        BrandDTO createdBrand = brandService.createBrand(brandDTO);
        return ResponseEntity.ok(createdBrand);
    }

    // Atualizar Marca
    @PutMapping("/edit/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable String id, @RequestBody BrandDTO brandDTO) {
        BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
        return ResponseEntity.ok(updatedBrand);
    }

    // Deletar Marca
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok().build();
    }

    // Obter Marca por ID
    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable String id) {
        BrandDTO brandDTO = brandService.getBrandById(id);
        return ResponseEntity.ok(brandDTO);
    }

    // Obter Todas as Marcas
    @GetMapping("/all")
    public ResponseEntity<Page<BrandDTO>> getAllBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BrandDTO> brands = brandService.getAllBrands(pageable);
        return ResponseEntity.ok(brands);
    }
}
