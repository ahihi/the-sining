var SLIDER_RES = 4096;
var SLIDER_MAX = SLIDER_RES - 1;

var scale = function(min0, max0, min1, max1, x) {
    return (x - min0) / (max0 - min0) * (max1 - min1) + min1;
};

var mix = function(x0, x1, k) {
    return (1-k)*x0 + k*x1;
};

var Sining = function() {
    var self = this;
    
    self.volume = new Tone.Volume(0).toMaster();
    self.sine = new Tone.Oscillator(440, "sine");
    self.sine.connect(self.volume);
    
    self.set_frequency = function(freq) {
        self.sine.frequency.value = freq;
    };
    
    self.set_volume = function(vol) {
        self.volume.volume.value = vol;
    };
    
    self.start = function() { self.sine.start(); };
    self.stop = function() { self.sine.stop(); };
}

var IsoSlider = function(name, unit, iso) {
    var self = this;
    
    unit = unit !== undefined ? unit : "";
    
    self.input = $("<input type='range'>");
    self.input.attr("name", name);
    self.input.attr("min", 0);
    self.input.attr("max", SLIDER_MAX);
    self.input.attr("value", 0);
    
    self.text = $("<span>");
            
    self.set_val = function(x) {
        self.input.val(x);
    };
    
    self.set_converted_val = function(y) {
        self.set_val(iso.bw(y));
    };
    
    self.val = function() {
        return parseFloat(self.input.val());
    };
    
    self.val_norm = function() {
        return self.val() / SLIDER_MAX;
    };
            
    self.converted_val = function() {
        return iso.fw(self.val());
    };
    
    self.converted_val_str = function() {
        return "" + self.converted_val().toFixed(2) + unit;
    };
    
    self.converted_val_norm = function() {
        var min = iso.fw(0);
        var max = iso.fw(SLIDER_MAX);
        return scale(min, max, 0, 1, self.converted_val());
    };
        
    self.on_change = function() {};
        
    self.update = function() {
        self.text.text(self.converted_val_str());
        self.on_change(self);
    };
    
    self.input.on("change", self.update);
    self.input.on("input", self.update);
};

var FreqSlider = function(min, max, val) {
    self = this;
    
    self.min = min;
    self.max = max;
    
    var p_min = Math.log(min) / Math.log(2);
    var p_max = Math.log(max) / Math.log(2);
    
    self.iso = {
        fw: function(x) {
            var p = scale(0, SLIDER_MAX, p_min, p_max, x);
            return Math.pow(2, p);
        },
        bw: function(y) { 
            var p = Math.log(y) / Math.log(2);
            return scale(p_min, p_max, 0, SLIDER_MAX, p);
        }
    };
    
    self.slider = new IsoSlider("frequency", " Hz", self.iso);
    self.slider.set_converted_val(val);
};

var VolSlider = function(min, max, val) {
    self = this;
    
    self.min = min;
    self.max = max;
    
    self.iso = {
        fw: function(x) {
            return scale(0, SLIDER_MAX, min, max, x);
        },
        bw: function(y) {
            return scale(min, max, 0, SLIDER_MAX, y);
        }
    };
    
    self.slider = new IsoSlider("volume", " dB", self.iso);
    self.slider.set_converted_val(val);
};

var sound_color = function(freq_slider, vol_slider) {
    var hue = scale(1, 0, -180, 0, freq_slider.slider.val_norm());
    var saturation = 1;
    var lightness = vol_slider.slider.converted_val_norm() * 0.5;
    
    var lightness_pct = "" + (lightness * 100) + "%";
    
    var color = "hsla(" + hue + ", 100%, " + lightness_pct + ", 1)";
    return color;
};

$(function() {    
    var body = $("body");

    var sining = new Sining();

    var freq_val = scale(0, 1, 60, 440, Math.random());
    var freq_slider = new FreqSlider(20, 22000, freq_val);
    
    var vol_val = scale(0, 1, -35, -30, Math.random());
    var vol_slider = new VolSlider(-100, 0, vol_val);

    var update_bg_color = function() {
        body.css("background-color", sound_color(freq_slider, vol_slider));
    };

    freq_slider.slider.on_change = function(slider) {
        sining.set_frequency(slider.converted_val());
        update_bg_color();
    };
    freq_slider.slider.update();
    body.append(freq_slider.slider.input);
    body.append(freq_slider.slider.text);

    vol_slider.slider.on_change = function(slider) {
        sining.set_volume(slider.converted_val());
        update_bg_color();
    };    
    vol_slider.slider.update();
    body.append(vol_slider.slider.input);
    body.append(vol_slider.slider.text);
    
    sining.start();
});
