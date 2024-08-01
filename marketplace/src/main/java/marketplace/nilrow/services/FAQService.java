package marketplace.nilrow.services;

import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.FAQ;
import marketplace.nilrow.repositories.AboutRepository;
import marketplace.nilrow.repositories.FAQRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FAQService {

    @Autowired
    private FAQRepository faqRepository;

    @Autowired
    private AboutRepository aboutRepository;

    public FAQ createFAQ(FAQ faq) {
        return faqRepository.save(faq);
    }

    public Optional<FAQ> getFAQById(String id) {
        return faqRepository.findById(id);
    }

    public Optional<FAQ> updateFAQ(String id, FAQ updatedFAQ) {
        Optional<FAQ> faqOptional = faqRepository.findById(id);
        if (faqOptional.isPresent()) {
            FAQ existingFAQ = faqOptional.get();
            existingFAQ.setQuestion(updatedFAQ.getQuestion());
            existingFAQ.setAnswer(updatedFAQ.getAnswer());
            return Optional.of(faqRepository.save(existingFAQ));
        } else {
            return Optional.empty();
        }
    }

    public void deleteFAQ(String id) {
        faqRepository.deleteById(id);
    }
}
