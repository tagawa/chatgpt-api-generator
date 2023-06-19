
        (function() {
            'use strict';

            let fieldCounter = 1;
            let chatgptTemp = document.getElementById('chatgpt_temp');
            let formDataCopy = { property: {}, description: {} }; // Copy of form data
            
            function createElement(tagName, { className = '', innerHTML = '', id = '', attrs = {} }, parentElement) {
                const element = document.createElement(tagName);

                if (className) {
                    element.className = className;
                }

                if (innerHTML) {
                    element.innerHTML = innerHTML;
                }

                if (id) {
                    element.id = id;
                }

                for (const attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        element.setAttribute(attrName, attrs[attrName]);
                    }
                }

                if (parentElement) {
                    parentElement.appendChild(element);
                }

                return element;
            }

            function showRemoveButton() {
                if (fieldCounter > 1) {
                    document.getElementById('removeFieldButton').classList.remove('hidden');
                } else {
                    document.getElementById('removeFieldButton').classList.add('hidden');
                }
            }
            
            function addFields() {
                let form = document.getElementById('inputForm');
                let newDiv = createElement('fieldset', {
                    className: 'field-pair',
                    innerHTML: `
                        <div class="input-group property">
                            <input type="text" id='input_property${fieldCounter}' name='input_property${fieldCounter}' data-output-id='output_property${fieldCounter},hidden_property${fieldCounter}' placeholder='Property name' aria-label='Property name'>
                        </div>
                        <div class="input-group description">
                            <input type="text" id='input_description${fieldCounter}' name='input_description${fieldCounter}' data-output-id='hidden_description${fieldCounter}' placeholder='Description' aria-label='Description'>
                        </div>
                    `
                });
            
                form.insertBefore(newDiv, document.getElementById('addFieldButton'));
    
                let newInputField = document.getElementById(`input_property${fieldCounter}`);
                newInputField.focus();
                
                let chatGptObjContent = document.getElementById('chatgpt_object_content');
                let propertiesContent = document.getElementById('properties_content');
                let hiddenRequiredList = document.getElementById('hidden_required_list');
                

                let newOutputPair = createElement('span', {
                    className: 'output-pair',
                    innerHTML: `,
        "<span id="output_property${fieldCounter}"></span>": "[content from ChatGPT]"`
                }, chatGptObjContent);
                
                let newHiddenPair = createElement('span', {
                    className: 'hidden-pair',
                innerHTML: `,
                "<span id="hidden_property${fieldCounter}"></span>": {
                    "type": "string",
                    "description": "<span id="hidden_description${fieldCounter}"></span>"
                }`
                }, propertiesContent);
                
                let newHiddenRequired = createElement('span', {
                    className: 'hidden-required',
                    innerHTML: `, "<span id="hidden_required${fieldCounter}"></span>"`
                }, hiddenRequiredList);

                formDataCopy.property[fieldCounter] = '';
                formDataCopy.description[fieldCounter] = '';

                fieldCounter++;
                showRemoveButton();

                // update code output
                updateCodeOutput();
            }

            function removeFields() {
                if (fieldCounter > 1) { // To prevent removal of first field pair

                    let fieldsets = document.getElementsByClassName('field-pair');
                    let lastFieldset = fieldsets[fieldsets.length - 1];

                    if (lastFieldset) { // Check if lastFieldset exists
                        let lastFieldId = lastFieldset.querySelector('.input-group.property input').id.replace('input_property', '');

                        // remove the fieldset element
                        lastFieldset.remove();

                        // remove from output
                        let lastOutputPair = document.getElementById(`output_property${lastFieldId}`).parentNode;
                        if (lastOutputPair) { // Check if lastOutputPair exists
                            lastOutputPair.remove();
                        }

                        // remove from hidden pair
                        let propertiesContent = document.getElementById('properties_content');
                        let lastHiddenPair = propertiesContent.getElementsByClassName('hidden-pair');
                        let lastHiddenPairElement = lastHiddenPair[lastHiddenPair.length - 1];
                        if (lastHiddenPairElement) { // Check if lastHiddenPairElement exists
                            lastHiddenPairElement.remove();
                        }
                        
                        // remove from required list
                        let lastHiddenRequired = document.getElementById(`hidden_required${lastFieldId}`).parentNode;
                        if (lastHiddenRequired) { // Check if lastHiddenRequired exists
                            lastHiddenRequired.remove();
                        }
                        

                        delete formDataCopy.property[lastFieldId];
                        delete formDataCopy.description[lastFieldId];

                        fieldCounter--;
                        showRemoveButton();
                    }
                }

                // update code output
                updateCodeOutput();
            }
            
            function updateCodeOutput() {
                // Replace the text content of each property and description span in chatgptTemp
                for (const id in formDataCopy.property) {
                    if (formDataCopy.property.hasOwnProperty(id)) {
                        const propertySpan = chatgptTemp.querySelector(`#hidden_property${id}`);
                        if (propertySpan) {
                            propertySpan.textContent = formDataCopy.property[id];
                        }
                        const descriptionSpan = chatgptTemp.querySelector(`#hidden_description${id}`);
                        if (descriptionSpan) {
                            descriptionSpan.textContent = formDataCopy.description[id];
                        }
                        const requiredSpan = chatgptTemp.querySelector(`#hidden_required${id}`);
                        if (requiredSpan) {
                            requiredSpan.textContent = formDataCopy.property[id];
                        }
                    }
                }

                let codeOutput = document.getElementById('code-output');
                codeOutput.textContent = chatgptTemp.textContent;
            }

            document.getElementById('inputForm').addEventListener('input', function(e) {
                // Check if the event target is an input element
                if (e.target.tagName === 'INPUT') {
                    // Get the ids of the elements that should be updated
                    const outputIds = e.target.dataset.outputId.split(',');
                    // Update the content of each corresponding element
                    outputIds.forEach(id => {
                        const outputElement = document.getElementById(id);
                        if (outputElement) {
                            outputElement.textContent = e.target.value;
                        }
                    });
                    

                    if (e.target.id.startsWith('input_property')) {
                        formDataCopy.property[e.target.id.replace('input_property', '')] = e.target.value;
                    } else if (e.target.id.startsWith('input_description')) {
                        formDataCopy.description[e.target.id.replace('input_description', '')] = e.target.value;
                    }
                    
                    // Update the code output
                    updateCodeOutput();
                }
            });
            

            document.addEventListener("DOMContentLoaded", (event) => {
                document.getElementById('addFieldButton').addEventListener('click', addFields);
                document.getElementById('removeFieldButton').addEventListener('click', removeFields);

                let inputs = document.querySelectorAll('#inputForm input');
                inputs.forEach(input => {
                    if (input.id.startsWith('input_property')) {
                        formDataCopy.property[input.id.replace('input_property', '')] = input.value;
                    } else if (input.id.startsWith('input_description')) {
                        formDataCopy.description[input.id.replace('input_description', '')] = input.value;
                    }
                });

                updateCodeOutput();
            });
            


        })();
        