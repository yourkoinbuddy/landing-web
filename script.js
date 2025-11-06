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

  function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
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

  const bancoSelect = document.getElementById('banco-select');
  const transacoesInput = document.getElementById('transacoes');
  const transacoesContainer = document.getElementById('transacoes-container');
  const previewLinkContainer = document.getElementById('preview-link-container');
  
  if (bancoSelect && transacoesInput) {
    bancoSelect.addEventListener('change', function() {
      if (this.value === 'teste') {
        if (previewLinkContainer) {
          previewLinkContainer.style.display = 'block';
        }
        
        if (transacoesContainer) {
          transacoesContainer.style.display = 'none';
        }
        
        fetch('transacoes-teste.csv')
          .then(response => response.blob())
          .then(blob => {
            const file = new File([blob], 'transacoes-teste.csv', { type: 'text/csv' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            transacoesInput.files = dataTransfer.files;
            
            // trigger change event to update UI
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
        transacoesInput.value = '';
      }
    });
  }
});
