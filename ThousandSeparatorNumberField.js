Ext.define("ThousandSeparatorNumberField", {
    override: "Ext.form.field.Number",
    
    /**
    * @cfg {Boolean} useThousandSeparator
    */
    useThousandSeparator: false,
    
    /**
     * @inheritdoc
     */
    toRawNumber: function (value) {
        return String(value).replace(this.decimalSeparator, '.').replace(new RegExp(Ext.util.Format.thousandSeparator, "g"), '');
    },
    
    /**
     * @inheritdoc
     */
    getErrors: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            errors = Ext.form.field.Text.prototype.getErrors.apply(me, arguments),
            format = Ext.String.format,
            num;

        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());

        if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
            return errors;
        }

        value = me.toRawNumber(value);

        if (isNaN(value.replace(Ext.util.Format.thousandSeparator, ''))) {
            errors.push(format(me.nanText, value));
        }

        num = me.parseValue(value);

        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        }
        else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }

        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }

        return errors;
    },
    
    /**
     * @inheritdoc
     */
     valueToRaw: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this;

        var format = "000,000";
        for (var i = 0; i < me.decimalPrecision; i++) {
            if (i == 0)
                format += ".";
            format += "0";
        }
        value = me.parseValue(Ext.util.Format.number(value, format));
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(me.toRawNumber(value));
        value = isNaN(value) ? '' : String(Ext.util.Format.number(value, format)).replace('.', me.decimalSeparator);
        return value;
    },
    
    /**
     * @inheritdoc
     */
    getSubmitValue: function () {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            value = me.callParent();

        if (!me.submitLocaleSeparator) {
            value = me.toRawNumber(value);
        }
        return value;
    },
    
    /**
     * @inheritdoc
     */
    setMinValue: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            allowed;

        me.minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
        me.toggleSpinners();

        // Build regexes for masking and stripping based on the configured options
        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + '';

            if (me.allowExponential) {
                allowed += me.decimalSeparator + 'e+-';
            }
            else {
                allowed += Ext.util.Format.thousandSeparator;
                if (me.allowDecimals) {
                    allowed += me.decimalSeparator;
                }
                if (me.minValue < 0) {
                    allowed += '-';
                }
            }

            allowed = Ext.String.escapeRegex(allowed);
            me.maskRe = new RegExp('[' + allowed + ']');
            if (me.autoStripChars) {
                me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
            }
        }
    },
    
    /**
     * @private
     */
    parseValue: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        value = parseFloat(this.toRawNumber(value));
        return isNaN(value) ? null : value;
    }
});