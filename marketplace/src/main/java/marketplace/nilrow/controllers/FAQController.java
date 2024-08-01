package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.FAQ;
import marketplace.nilrow.domain.channel.about.FAQDTO;
import marketplace.nilrow.services.FAQService;
import marketplace.nilrow.services.AboutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/faqs")
@Tag(name = "Channel", description = "Operações relacionadas a FAQs")
public class FAQController {

    @Autowired
    private FAQService faqService;

    @Autowired
    private AboutService aboutService;

    @PostMapping("/create")
    public ResponseEntity<FAQDTO> createFAQ(@RequestBody FAQDTO faqDTO) {
        Optional<About> aboutOpt = aboutService.getAboutById(faqDTO.getAboutId());
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        FAQ faq = new FAQ();
        faq.setAbout(aboutOpt.get());
        faq.setQuestion(faqDTO.getQuestion());
        faq.setAnswer(faqDTO.getAnswer());

        FAQ savedFAQ = faqService.createFAQ(faq);
        FAQDTO responseDTO = new FAQDTO(
                savedFAQ.getId(),
                savedFAQ.getQuestion(),
                savedFAQ.getAnswer(),
                savedFAQ.getAbout().getId()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FAQDTO> getFAQById(@PathVariable String id) {
        Optional<FAQ> faqOpt = faqService.getFAQById(id);
        if (faqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FAQ faq = faqOpt.get();
        FAQDTO faqDTO = new FAQDTO(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getAbout().getId()
        );

        return ResponseEntity.ok(faqDTO);
    }

    @GetMapping("/about/{aboutId}")
    public ResponseEntity<List<FAQDTO>> getFAQsByAboutId(@PathVariable String aboutId) {
        Optional<About> aboutOpt = aboutService.getAboutById(aboutId);
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<FAQ> faqs = aboutOpt.get().getFaqs();
        List<FAQDTO> faqDTOs = faqs.stream()
                .map(faq -> new FAQDTO(faq.getId(), faq.getQuestion(), faq.getAnswer(), aboutId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(faqDTOs);
    }


    @PutMapping("/edit/{id}")
    public ResponseEntity<FAQDTO> editFAQ(@PathVariable String id, @RequestBody FAQDTO faqDTO) {
        Optional<FAQ> faqOpt = faqService.getFAQById(id);
        if (faqOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FAQ existingFAQ = faqOpt.get();

        if (faqDTO.getQuestion() != null) {
            existingFAQ.setQuestion(faqDTO.getQuestion());
        }
        if (faqDTO.getAnswer() != null) {
            existingFAQ.setAnswer(faqDTO.getAnswer());
        }

        FAQ updatedFAQ = faqService.createFAQ(existingFAQ);
        FAQDTO responseDTO = new FAQDTO(
                updatedFAQ.getId(),
                updatedFAQ.getQuestion(),
                updatedFAQ.getAnswer(),
                updatedFAQ.getAbout().getId()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable String id) {
        faqService.deleteFAQ(id);
        return ResponseEntity.ok().build();
    }
}
