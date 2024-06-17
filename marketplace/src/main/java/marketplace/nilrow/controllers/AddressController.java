package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.address.Address;
import marketplace.nilrow.domain.address.AddressDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.repositories.AddressRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/address")
@Tag(name = "People", description = "Operações relacionadas aos endereços dos usuários")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PeopleRepository peopleRepository;

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAddresses() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        List<Address> addresses = addressRepository.findByPeople(people);
        List<AddressDTO> addressDTOs = addresses.stream().map(AddressDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(addressDTOs);
    }

    @PostMapping
    public ResponseEntity<AddressDTO> addAddress(@RequestBody AddressDTO addressDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Address address = new Address(
                addressDTO.getRecipientName(),
                addressDTO.getRecipientPhone(),
                addressDTO.getCep(),
                addressDTO.getState(),
                addressDTO.getCity(),
                addressDTO.getNeighborhood(),
                addressDTO.getStreet(),
                addressDTO.getNumber(),
                addressDTO.getComplement(),
                addressDTO.getClassification(),
                addressDTO.getType(),
                addressDTO.getTypeName(),
                addressDTO.isPackagesInLodge(),
                addressDTO.getLodgeDays(),
                addressDTO.isLodgeOpen24h(),
                addressDTO.isLodgeClosed(),
                addressDTO.getLodgeOpenHour(),
                addressDTO.getLodgeCloseHour(),
                people
        );
        address = addressRepository.save(address);
        return ResponseEntity.ok(new AddressDTO(address));
    }
}
