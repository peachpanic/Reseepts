"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories, Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_OPTIONS = [
  "🍔",
  "🚗",
  "🏠",
  "💡",
  "🎬",
  "🏋️",
  "📚",
  "✈️",
  "🏥",
  "💅",
  "🛍️",
  "⚽",
  "🍕",
  "☕",
  "🎮",
  "📱",
];

export default function CategoryDialog({ isOpen, onClose }: CategoryDialogProps) {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "🏷️" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleFetchCategories = async () => {
    await fetchCategories();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createCategory({
        category_name: formData.name,
        icon: formData.icon,
      });
      setFormData({ name: "", icon: "🏷️" });
    } catch (err) {
      console.error("Failed to create category:", err);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;

    try {
      await updateCategory(id, {
        category_name: formData.name,
        icon: formData.icon,
      });
      setFormData({ name: "", icon: "🏷️" });
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setIsDeleting(true);
      try {
        await deleteCategory(categoryToDelete);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (err) {
        console.error("Failed to delete category:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const startEdit = (category: Category) => {
    setFormData({
      name: category.category_name,
      icon: category.icon,
    });
    setEditingId(category.category_id || "");
  };

  const cancelEdit = () => {
    setFormData({ name: "", icon: "🏷️" });
    setEditingId(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 z-40"
            />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-600 px-6 py-4 text-white">
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <p className="text-sm text-teal-100">Add, edit, or delete expense categories</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingId) {
                    handleUpdate(editingId);
                  } else {
                    handleCreate(e);
                  }
                }} className="mb-6 pb-6 border-b border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Food, Rent, Utilities"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon })
                          }
                          className={`cursor-pointer p-2 text-xl rounded-lg transition-all ${
                            formData.icon === icon
                              ? "bg-teal-600 scale-110"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!formData.name.trim() || loading}
                      className="cursor-pointer flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {editingId ? "Update" : "Add"} Category
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Categories List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Your Categories ({categories.length})
                    </h3>
                    <button
                      onClick={handleFetchCategories}
                      disabled={loading}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                    >
                      {loading ? "Loading..." : "Refresh"}
                    </button>
                  </div>

                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="w-9 h-9 rounded-lg" />
                            <Skeleton className="w-9 h-9 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No categories yet. Create one to get started!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <motion.div
                          key={category.category_id}
                          layout
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{category.icon}</span>
                            <span className="font-medium text-gray-900">
                              {category.category_name}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(category)}
                              disabled={isDeleting}
                              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(category.category_id || "")
                              }
                              disabled={isDeleting}
                              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Delete"
                            >
                              {isDeleting ? (
                                <span className="flex items-center gap-1">
                                  <span className="inline-block animate-spin text-xs">⏳</span>
                                  Deleting
                                </span>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Delete Confirmation Alert Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
