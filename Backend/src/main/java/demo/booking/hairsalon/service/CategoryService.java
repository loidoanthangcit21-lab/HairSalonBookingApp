package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.CategoryRequest;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    Page<CategoryResponse> getCategories(Pageable pageable);
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(UUID id, CategoryRequest request);
    void deleteCategory(UUID id);
}
