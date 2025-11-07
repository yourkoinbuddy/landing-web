// tab switch
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.tab');
  const b2cContent = document.getElementById('b2c-content');
  const b2bContent = document.getElementById('b2b-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      
      this.classList.add('active');
      
      if (targetTab === 'b2c') {
        b2cContent.style.display = 'block';
        b2bContent.style.display = 'none';
      } else {
        b2cContent.style.display = 'none';
        b2bContent.style.display = 'block';
      }
    });
  });

  // forms
  const b2cForm = document.getElementById('b2c-form');
  const b2bForm = document.getElementById('b2b-form');
  const leadTopForm = document.getElementById('lead-top-form');
  const leadBottomForm = document.getElementById('lead-bottom-form');

  function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    
    // Validate challenges field for B2B form and ensure all values are captured
    const challengesSelect = form.querySelector('#challenges');
    const challengesTrigger = form.querySelector('#challenges-trigger');
    
    if (formType === 'B2B' && challengesSelect && challengesTrigger) {
      // Get all selected checkboxes
      const selectedCheckboxes = Array.from(form.querySelectorAll('.challenge-checkbox:checked'));
      const selectedValues = selectedCheckboxes.map(cb => cb.value);
      
      // Ensure all selected options are marked in the hidden select
      Array.from(challengesSelect.options).forEach(option => {
        option.selected = selectedValues.includes(option.value);
      });
      
      if (selectedValues.length === 0) {
        // Show error message in placeholder
        challengesTrigger.value = '';
        challengesTrigger.placeholder = '⚠️ Por favor, selecione pelo menos um desafio financeiro.';
        challengesTrigger.classList.add('error');
        // Focus and open the dropdown
        challengesTrigger.focus();
        setTimeout(() => {
          challengesTrigger.click();
        }, 100);
        return;
      } else {
        // Remove error state if valid
        challengesTrigger.classList.remove('error');
      }
    }
    
    const formData = new FormData(form);
    
    // For B2B form, manually add all selected challenge values to ensure they're all included
    if (formType === 'B2B' && challengesSelect) {
      // Remove the challenges field from FormData first
      formData.delete('challenges');
      // Add each selected value individually
      const selectedValues = Array.from(challengesSelect.selectedOptions).map(opt => opt.value);
      selectedValues.forEach(value => {
        formData.append('challenges', value);
      });
    }
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = form.querySelector('.success-message');
    const formElements = form.querySelectorAll('input, select, textarea, button');
    
    formElements.forEach(element => {
      element.disabled = true;
    });
    if (submitButton) {
      submitButton.textContent = 'A enviar...';
    }
    
    const endpoint = formType === 'B2C' ? '/api/submit-b2c' : '/api/submit-b2b';
    
    fetch(endpoint, {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao enviar formulário');
      }
      return response.json();
    })
    .then(data => {
      console.log(formType + ' Form submitted successfully:', data);
      
      if (successMessage) {
        successMessage.style.display = 'block';
      }
      
      setTimeout(() => {
        form.reset();
        if (successMessage) {
          successMessage.style.display = 'none';
        }
        formElements.forEach(element => {
          element.disabled = false;
        });
        if (submitButton) {
          submitButton.textContent = formType === 'B2C' ? 'Obter Análise Gratuita' : 'Junte-se à Lista de Espera';
        }
      }, 3000);
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar formulário. Por favor, tente novamente.');
      
      // Re-enable form elements
      formElements.forEach(element => {
        element.disabled = false;
      });
      if (submitButton) {
        submitButton.textContent = formType === 'B2C' ? 'Obter Análise Gratuita' : 'Juntar-se à Lista de Espera';
      }
    });
  }

  b2cForm.addEventListener('submit', function(e) {
    handleFormSubmit(e, 'B2C');
  });

  b2bForm.addEventListener('submit', function(e) {
    handleFormSubmit(e, 'B2B');
  });

  function handleQuickLeadSubmit(event, position) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    formData.append('position', position);
    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = form.querySelector('.success-message');
    const inputs = form.querySelectorAll('input, button');

    inputs.forEach(el => el.disabled = true);
    if (submitButton) submitButton.textContent = 'A enviar...';

    fetch('/api/subscribe', { method: 'POST', body: formData })
      .then(r => { if (!r.ok) throw new Error('Falha no envio'); return r.json().catch(() => ({})); })
      .then(() => {
        if (successMessage) successMessage.style.display = 'inline';
        setTimeout(() => {
          form.reset();
          if (successMessage) successMessage.style.display = 'none';
          inputs.forEach(el => el.disabled = false);
          if (submitButton) submitButton.textContent = position === 'top' ? 'Manter-me Informado' : 'Subscrever';
        }, 2500);
      })
      .catch(() => {
        alert('Não foi possível enviar. Tente novamente.');
        inputs.forEach(el => el.disabled = false);
        if (submitButton) submitButton.textContent = position === 'top' ? 'Manter-me Informado' : 'Subscrever';
      });
  }
  if (leadTopForm) {
    leadTopForm.addEventListener('submit', function(e) { handleQuickLeadSubmit(e, 'top'); });
  }
  if (leadBottomForm) {
    leadBottomForm.addEventListener('submit', function(e) { handleQuickLeadSubmit(e, 'bottom'); });
  }

  const bancoSelect = document.getElementById('banco-select');
  const transacoesInput = document.getElementById('transacoes');
  const transacoesContainer = document.getElementById('transacoes-container');
  const previewLinkContainer = document.getElementById('preview-link-container');
  
  function handleBancoSelection(selectElement) {
    if (selectElement.value === 'teste') {
      if (previewLinkContainer) {
        previewLinkContainer.style.display = 'block';
      }
      if (transacoesContainer) {
        transacoesContainer.style.display = 'none';
      }
      if (transacoesInput) {
        transacoesInput.removeAttribute('required');
      }
      fetch('transacoes-teste.csv')
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'transacoes-teste.csv', { type: 'text/csv' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          transacoesInput.files = dataTransfer.files;
          transacoesInput.dispatchEvent(new Event('change', { bubbles: true }));
        })
        .catch(error => {
          console.error('Erro ao carregar ficheiro de teste:', error);
          alert('Erro ao carregar ficheiro de teste. Por favor, carregue manualmente o ficheiro.');
        });
    } else {
      if (previewLinkContainer) {
        previewLinkContainer.style.display = 'none';
      }
      if (transacoesContainer) {
        transacoesContainer.style.display = 'block';
      }
      if (transacoesInput) {
        transacoesInput.setAttribute('required', 'required');
        transacoesInput.value = '';
      }
    }
  }
  
  if (bancoSelect && transacoesInput) {
    handleBancoSelection(bancoSelect);
    bancoSelect.addEventListener('change', function() {
      handleBancoSelection(this);
    });
  }

  // Challenges multi-select dropdown
  const challengesTrigger = document.getElementById('challenges-trigger');
  const challengesDropdown = document.getElementById('challenges-dropdown');
  const challengesSelect = document.getElementById('challenges');
  const challengeCheckboxes = document.querySelectorAll('.challenge-checkbox');
  
  const challengeLabels = {
    'fluxo-caixa': 'Gestão de fluxo de caixa',
    'planeamento-orcamento': 'Planeamento de orçamento',
    'decisoes-estrategicas': 'Tomada de decisões estratégicas',
    'controlo-despesas': 'Controlo de despesas',
    'previsao-financeira': 'Previsão financeira',
    'analise-rentabilidade': 'Análise de rentabilidade',
    'gestao-credito': 'Gestão de crédito e cobrança',
    'investimentos': 'Decisões de investimento',
    'custos-operacionais': 'Redução de custos operacionais',
    'crescimento-escalonamento': 'Planeamento de crescimento/escalonamento',
    'reporting-financeiro': 'Reporting e análise financeira',
    'outros': 'Outros'
  };

  function updateChallengesDisplay() {
    const selected = Array.from(challengeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // Update hidden select
    Array.from(challengesSelect.options).forEach(option => {
      option.selected = selected.includes(option.value);
    });

    // Update input value
    if (selected.length === 0) {
      challengesTrigger.value = '';
      challengesTrigger.placeholder = 'Selecione os desafios que se aplicam';
    } else {
      // Remove error state when selection is made
      challengesTrigger.classList.remove('error');
      
      // Show first selected item and count of additional items
      const firstSelected = selected[0];
      const firstSelectedText = challengeLabels[firstSelected] || firstSelected;
      
      if (selected.length === 1) {
        challengesTrigger.value = firstSelectedText;
      } else {
        const remainingCount = selected.length - 1;
        challengesTrigger.value = `${firstSelectedText} + ${remainingCount}`;
      }
      
      challengesTrigger.placeholder = '';
    }
  }

  if (challengesTrigger) {
    challengesTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = challengesDropdown.classList.contains('visible');
      if (isOpen) {
        challengesDropdown.classList.remove('visible');
        challengesTrigger.classList.remove('open');
      } else {
        challengesDropdown.classList.add('visible');
        challengesTrigger.classList.add('open');
      }
    });
  }

  document.addEventListener('click', function(e) {
    if (challengesDropdown && challengesTrigger && 
        !challengesDropdown.contains(e.target) && 
        !challengesTrigger.contains(e.target)) {
      challengesDropdown.classList.remove('visible');
      challengesTrigger.classList.remove('open');
    }
  });

  if (challengesDropdown) {
    challengesDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  challengeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateChallengesDisplay);
  });

  if (challengesTrigger) {
    updateChallengesDisplay();
  }
});
