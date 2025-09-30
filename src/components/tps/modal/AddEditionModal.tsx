import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Modal, ModalClose, ModalContent } from "./ModalComponents";
import { addEdition, AddEditionRequest } from "../../../api/editionApi";

const FormContainer = styled.div`
  padding: 1.5rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #333;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.full-width {
    grid-column: span 2;
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;

  &.required::after {
    content: " *";
    color: #e74c3c;
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: #fafafa;
  color: black;

  &:focus {
    outline: none;
    border-color: #74b9ff;
    background-color: white;
  }

  &:invalid {
    border-color: #fd79a8;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  background-color: #fafafa;
  color: black;

  &:focus {
    outline: none;
    border-color: #74b9ff;
    background-color: white;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: #fafafa;
  color: black;

  &:focus {
    outline: none;
    border-color: #74b9ff;
    background-color: white;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #3498db;
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: #95a5a6;
  color: white;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 0.875rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f0f9f0;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
`;

const LAST_KEY_STORAGE_KEY = "addEditionModal_lastKey";

const getSuggestedKey = (): string => {
  const lastKey = localStorage.getItem(LAST_KEY_STORAGE_KEY);
  if (!lastKey) return "";

  const match = lastKey.match(/^(.+)-(\d+)$/);
  if (match) {
    const [, text, counter] = match;
    const newCounter = parseInt(counter, 10) + 1;
    return `${text}-${newCounter}`;
  }

  return lastKey;
};

const saveLastKey = (key: string): void => {
  localStorage.setItem(LAST_KEY_STORAGE_KEY, key);
};

interface AddEditionModalProps {
  onClose: () => void;
}

export const AddEditionModal = ({ onClose }: AddEditionModalProps) => {
  const [formData, setFormData] = useState<AddEditionRequest>({
    key: "",
    year: "",
    city: "",
    language: "",
    "author (normalized)": "",
    title: "",
    title_EN: "",
    type: "secondary",
    "publisher (normalized)": "",
    imprint: "",
    imprint_EN: "",
    ustc_id: "",
    scan_url: "",
    tp_url: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const suggestedKey = getSuggestedKey();
    if (suggestedKey) {
      setFormData((prev) => ({
        ...prev,
        key: suggestedKey,
        tp_url: `/tps/${suggestedKey}_tp.png`,
      }));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const isFormValid = () => {
    return (
      formData.key.trim() &&
      formData.year.trim() &&
      formData.city.trim() &&
      formData.language.trim() &&
      formData["author (normalized)"].trim() &&
      formData.title.trim() &&
      formData.type &&
      formData["publisher (normalized)"].trim() &&
      formData.imprint.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await addEdition(formData);
      saveLastKey(formData.key);
      setSuccess(`Edition "${formData.key}" added successfully!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add edition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal>
      <ModalContent onClick={(e) => e.stopPropagation()} hasImage={false}>
        <ModalClose title="Close" onClick={onClose}>
          ✕
        </ModalClose>
        <FormContainer>
          <Title>Add an Edition</Title>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormField>
                <Label className="required">Key</Label>
                <Input
                  type="text"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label className="required">Year</Label>
                <Input
                  type="number"
                  name="year"
                  min={1450}
                  max={1750}
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label className="required">City</Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label className="required">Language</Label>
                <Input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField>
                <Label className="required">Type</Label>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="secondary">Secondary</option>
                  <option value="elements">Elements</option>
                </Select>
              </FormField>

              <FormField>
                <Label>USTC ID</Label>
                <Input
                  type="text"
                  name="ustc_id"
                  value={formData.ustc_id}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField className="full-width">
                <Label className="required">Author (Normalized)</Label>
                <Input
                  type="text"
                  name="author (normalized)"
                  value={formData["author (normalized)"]}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField className="full-width">
                <Label className="required">Publisher (Normalized)</Label>
                <Input
                  type="text"
                  name="publisher (normalized)"
                  value={formData["publisher (normalized)"]}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField className="full-width">
                <Label className="required">Title</Label>
                <TextArea
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField className="full-width">
                <Label className="required">Imprint</Label>
                <TextArea
                  name="imprint"
                  value={formData.imprint}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField className="full-width">
                <Label>Title (English)</Label>
                <TextArea
                  name="title_EN"
                  value={formData.title_EN}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField className="full-width">
                <Label>Imprint (English)</Label>
                <TextArea
                  name="imprint_EN"
                  value={formData.imprint_EN}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField className="full-width">
                <Label>Scan URL</Label>
                <Input
                  type="url"
                  name="scan_url"
                  value={formData.scan_url}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField className="full-width">
                <Label>Title Page URL</Label>
                <Input
                  type="text"
                  name="tp_url"
                  value={formData.tp_url}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField className="full-width">
                <Label>Notes</Label>
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGrid>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <ButtonContainer>
              <CancelButton type="button" onClick={onClose}>
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? "Adding..." : "Add"}
              </SubmitButton>
            </ButtonContainer>
          </form>
        </FormContainer>
      </ModalContent>
    </Modal>
  );
};
