package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.address.Address;
import marketplace.nilrow.domain.address.AddressClassification;
import marketplace.nilrow.domain.address.AddressClassificationDTO;
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

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/address")
@Tag(name = "Profile", description = "Operações relacionadas aos endereços dos usuários")
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

    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable String id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Address address = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(new AddressDTO(address));
    }


    @PostMapping
    public ResponseEntity<Void> addAddress(@RequestBody AddressDTO addressDTO) {
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
                addressDTO.getMoreInformation(),
                people
        );

        addressRepository.save(address);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateAddress(@PathVariable String id, @RequestBody AddressDTO addressDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Address address = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        address.setRecipientName(addressDTO.getRecipientName());
        address.setRecipientPhone(addressDTO.getRecipientPhone());
        address.setCep(addressDTO.getCep());
        address.setState(addressDTO.getState());
        address.setCity(addressDTO.getCity());
        address.setNeighborhood(addressDTO.getNeighborhood());
        address.setStreet(addressDTO.getStreet());
        address.setNumber(addressDTO.getNumber());
        address.setComplement(addressDTO.getComplement());
        address.setClassification(addressDTO.getClassification());
        address.setMoreInformation(addressDTO.getMoreInformation());

        addressRepository.save(address);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable String id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);

        Address address = addressRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getPeople().equals(people)) {
            return ResponseEntity.status(403).build();
        }

        addressRepository.delete(address);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/classifications")
    public ResponseEntity<List<AddressClassificationDTO>> getClassifications() {
        List<AddressClassificationDTO> classifications = Arrays.stream(AddressClassification.values())
                .map(classification -> new AddressClassificationDTO(classification.name(), classification.getClassification()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(classifications);
    }
}
