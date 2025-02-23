package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.product.brand.Brand;
import marketplace.nilrow.domain.catalog.product.brand.BrandDTO;
import marketplace.nilrow.repositories.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    // Criar Marca
    public BrandDTO createBrand(BrandDTO brandDTO) {
        Brand brand = new Brand();
        brand.setName(brandDTO.getName());

        Brand savedBrand = brandRepository.save(brand);
        return convertToDTO(savedBrand);
    }

    // Atualizar Marca
    public BrandDTO updateBrand(String brandId, BrandDTO brandDTO) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));

        brand.setName(brandDTO.getName());

        Brand updatedBrand = brandRepository.save(brand);
        return convertToDTO(updatedBrand);
    }

    // Deletar Marca
    public void deleteBrand(String brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));

        brandRepository.delete(brand);
    }

    // Obter Marca por ID
    public BrandDTO getBrandById(String brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));

        return convertToDTO(brand);
    }

    // Obter Todas as Marcas
    public Page<BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    // Converter Entidade para DTO
    private BrandDTO convertToDTO(Brand brand) {
        return new BrandDTO(brand.getId(), brand.getName());
    }
}