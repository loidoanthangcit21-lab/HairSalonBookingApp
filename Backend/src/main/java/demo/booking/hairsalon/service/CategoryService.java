package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.CategoryRequest;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getAllActiveCategories();
    List<CategoryResponse> getAllCategoriesAdmin();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(UUID id, CategoryRequest request);
    void deleteCategory(UUID id);
}
