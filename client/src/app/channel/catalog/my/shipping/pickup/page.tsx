"use client";

import React, {
  useState,
  memo,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import StageButton from '@/components/UI/StageButton/StageButton';
import Card from "@/components/UI/Card/Card";
import styles from "./pickup.module.css";
import {
  getPickupByCatalogId,
  createPickup,
  updatePickup,
  deletePickup,
} from "@/services/pickupService";
import { PickupDTO } from "@/types/services/pickup";

function Pickup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [pickup, setPickup] = useState<PickupDTO | null>(null);

  // Estado para os valores do formulário
  const [formValues, setFormValues] = useState({
    active: false,
    prazoRetirada: 0,
    precoRetirada: 0,
  });

  // Busca o catalogId do localStorage e, se não existir, redireciona
  useEffect(() => {
    const storedCatalogId = localStorage.getItem("selectedCatalogId");
    if (!storedCatalogId) {
      router.push("/channel/catalog/my");
    } else {
      setCatalogId(storedCatalogId);
    }
  }, [router]);

  // Função para voltar à tela anterior
  const handleBack = useCallback(() => {
    router.push("/channel/catalog/my/shipping");
  }, [router]);

  // Detecta se o dispositivo é mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    // Se desejar atualizar em resize, descomente:
    // window.addEventListener("resize", checkIsMobile);
    // return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Busca ou cria um pickup com base no catalogId
  useEffect(() => {
    if (!catalogId) return;

    const fetchOrCreatePickup = async () => {
      setLoading(true);
      try {
        // Tenta buscar o pickup pelo catalogId
        const existingPickup = await getPickupByCatalogId(catalogId);
        setPickup(existingPickup);
        setFormValues({
          active: existingPickup.active,
          prazoRetirada: existingPickup.prazoRetirada,
          precoRetirada: existingPickup.precoRetirada,
        });
      } catch (error: any) {
        console.error("Pickup não encontrada, criando novo. Erro:", error);
        // Se não encontrar, cria um novo pickup com valores padrão
        try {
          const newPickupData = {
            catalogId,
            active: false,
            prazoRetirada: 0,
            precoRetirada: 0,
          };
          const createdPickup = await createPickup(newPickupData);
          setPickup(createdPickup);
          setFormValues({
            active: createdPickup.active,
            prazoRetirada: createdPickup.prazoRetirada,
            precoRetirada: createdPickup.precoRetirada,
          });
        } catch (createError) {
          console.error("Erro ao criar pickup:", createError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreatePickup();
  }, [catalogId]);

  // Atualiza os valores do formulário conforme o usuário interage
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      // Type guard: se for checkbox, garante que é um HTMLInputElement
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: Number(value) }));
    }
  };

  // Função que alterna o campo "active" e chama o updatePickup para atualizar somente esse campo
  const toggleActiveAndUpdate = useCallback(async () => {
    if (!pickup) return;
    const newActive = !formValues.active;
    setFormValues((prev) => ({ ...prev, active: newActive }));
    setLoading(true);
    try {
      // Atualiza o pickup passando os valores atuais, mas alterando somente o "active"
      const updated = await updatePickup(pickup.id, {
        catalogId: pickup.catalogId,
        active: newActive,
        prazoRetirada: formValues.prazoRetirada,
        precoRetirada: formValues.precoRetirada,
      });
      setPickup(updated);
      // Opcional: exibir uma notificação de sucesso
      // alert("Pickup atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar pickup:", error);
      alert("Erro ao atualizar pickup.");
      // Caso ocorra erro, reverte o toggle
      setFormValues((prev) => ({ ...prev, active: !newActive }));
    } finally {
      setLoading(false);
    }
  }, [
    pickup,
    formValues.active,
    formValues.prazoRetirada,
    formValues.precoRetirada,
  ]);

  // Atualiza o pickup via API para outras alterações (salvar dados do formulário)
  const handleUpdate = async () => {
    if (!pickup) return;
    setLoading(true);
    try {
      const updated = await updatePickup(pickup.id, {
        catalogId: pickup.catalogId,
        active: formValues.active,
        prazoRetirada: formValues.prazoRetirada,
        precoRetirada: formValues.precoRetirada,
      });
      setPickup(updated);
      alert("Pickup atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar pickup:", error);
      alert("Erro ao atualizar pickup.");
    } finally {
      setLoading(false);
    }
  };

  // Exclui o pickup via API
  const handleDelete = async () => {
    if (!pickup) return;
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este pickup?"
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deletePickup(pickup.id);
      alert("Pickup excluído com sucesso!");
      setPickup(null);
      // Opcional: redirecionar após exclusão:
      // router.push("/channel/catalog/my/shipping");
    } catch (error) {
      console.error("Erro ao excluir pickup:", error);
      alert("Erro ao excluir pickup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pickupPage}>
      {pickup && (
        <>
          {/* Versão Mobile */}
          {isMobile && (
            <MobileHeader
              title={`Delivery ${pickup.active ? "Ativo" : "Inativo"}`}
              buttons={{ close: true, filter: true }}
              handleBack={handleBack}
              // Passa a função que alterna o active e atualiza via API
              onFilter={toggleActiveAndUpdate}
            />
          )}
        </>
      )}

      {loading && <LoadingSpinner />}

      <div className={styles.pickupContainer}>
        {pickup && (
          <div className={styles.visualizationHeader}>
            <SubHeader
              title={`Delivery ${pickup.active ? "Ativo" : "Inativo"}`}
              handleBack={handleBack}
              showActiveFilterButton
              // Passa a função que alterna o active e atualiza via API
              handleActiveFilter={toggleActiveAndUpdate}
            />
          </div>
        )}

        <Card title="Editar">
          {pickup ? (
            <>
              <CustomInput
                title="Prazo"
                name="prazoRetirada"
                value={formValues.prazoRetirada}
                onChange={handleChange}
                bottomLeftText="Defina o tempo até estar pronto para ser retirado"
              />
              <CustomInput
                title="Preço"
                name="precoRetirada"
                value={formValues.precoRetirada}
                onChange={handleChange}
                bottomLeftText="Caso queira de graça, deixe 0"
              />
              <div className={styles.pickupConfirmationButtonSpace}>
                <StageButton
                  text="Salvar"
                  backgroundColor="#7B33E5"
                  type="submit"
                  onClick={handleUpdate}
                />
              </div>
            </>
          ) : (
            <p>Nenhum pickup encontrado.</p>
          )}
        </Card>

      </div>
    </div>
  );
}

export default memo(Pickup);
