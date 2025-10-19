import { Category } from "@/lib/definitions";
import { useState, useCallback } from "react";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create category
  const createCategory = useCallback(
    async (category: Omit<Category, "category_id">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(category),
        });
        if (!response.ok) throw new Error("Failed to create category");
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        return newCategory;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update category
  const updateCategory = useCallback(
    async (categoryId: number, updates: Partial<Omit<Category, "category_id" | "user_id">>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error("Failed to update category");
        const updatedCategory = await response.json();
        setCategories((prev) =>
          prev.map((cat) => (cat.category_id === categoryId ? updatedCategory : cat))
        );
        return updatedCategory;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete category
  const deleteCategory = useCallback(async (categoryId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev.filter((cat) => cat.category_id !== categoryId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
export { Category };

