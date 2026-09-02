import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useUPConfig } from '../../config/useUPConfig';
import { getPx, type UPDimension } from '../../utils';
import { UPIcon } from '../icon';
export type UPNumberBoxProps={name?:string|number;value?:number|string;modelValue?:number|string;defaultValue?:number|string;min?:number|string;max?:number|string;step?:number|string;integer?:boolean;disabled?:boolean;disabledInput?:boolean;asyncChange?:boolean;inputWidth?:UPDimension;showMinus?:boolean;showPlus?:boolean;decimalLength?:number|string|null;longPress?:boolean;color?:string;buttonWidth?:UPDimension;buttonSize?:UPDimension;buttonRadius?:UPDimension;bgColor?:string;disabledBgColor?:string;inputBgColor?:string;cursorSpacing?:UPDimension;disableMinus?:boolean;disablePlus?:boolean;iconStyle?:StyleProp<TextStyle>;miniMode?:boolean;customStyle?:StyleProp<ViewStyle>;customClass?:string;onChange?:(value:number,name:string|number)=>void;onBlur?:(value:number,name:string|number)=>void;
/** Source `focus` event: input focus with current value and name. */
onFocus?:(payload:{value:number;name:string|number})=>void;
/** Source `input` event: fires on value change (same timing as `onChange`). */
onInput?:(value:number)=>void;
/** Source `overlimit` event: fires when pressing a button at the min/max boundary. */
onOverlimit?:(type:'minus'|'plus')=>void;
/** Source `minus` event: fires on a successful minus press. */
onMinus?:()=>void;
/** Source `plus` event: fires on a successful plus press. */
onPlus?:()=>void;
/** Source `minus` slot: replaces the default minus button. */
minusNode?:React.ReactNode;
/** Source `input` slot: replaces the default value input. */
inputNode?:React.ReactNode;
/** Source `plus` slot: replaces the default plus button. */
plusNode?:React.ReactNode;};
function format(value:number,decimalLength:number|string|null){return decimalLength===null?value:Number(value.toFixed(Number(decimalLength)))}
export function UPNumberBox(input:UPNumberBoxProps):React.JSX.Element {const config=useUPConfig();const props={...config.props.numberBox,...input};const external=input.value??input.modelValue;const [inner,setInner]=useState(Number(external??input.defaultValue??props.value));useEffect(()=>{if(external!==undefined)setInner(Number(external))},[external]);const min=Number(props.min),max=Number(props.max),step=Number(props.step);const update=(raw:number)=>{let next=Math.max(min,Math.min(max,raw));if(props.integer)next=Math.round(next);next=format(next,props.decimalLength);if(external===undefined&&!props.asyncChange)setInner(next);input.onChange?.(next,props.name);input.onInput?.(next)};const press=(kind:'minus'|'plus')=>{if(inner<=min&&kind==='minus'||inner>=max&&kind==='plus'){input.onOverlimit?.(kind);return}if(kind==='plus')input.onPlus?.();else input.onMinus?.();update(inner+(kind==='plus'?step:-step))};const minusDisabled=props.disabled||props.disableMinus;const plusDisabled=props.disabled||props.disablePlus;const button=(kind:'minus'|'plus',disabled:boolean)=> <Pressable accessibilityLabel={kind} disabled={disabled} onPress={()=>press(kind)} style={{alignItems:'center',backgroundColor:disabled?props.disabledBgColor||'#f7f7f7':props.bgColor||'#f7f7f7',borderRadius:getPx(props.buttonRadius),height:getPx(props.buttonSize),justifyContent:'center',opacity:disabled?.6:1,width:getPx(props.buttonWidth)}} testID={`up-number-box-${kind}`}><UPIcon color={props.color||'#303133'} name={kind} size={16}/></Pressable>;const slotButton=(kind:'minus'|'plus',disabled:boolean,node:React.ReactNode)=> <Pressable accessibilityLabel={kind} disabled={disabled} onPress={()=>press(kind)} testID={`up-number-box-${kind}`}>{node}</Pressable>;return <View style={[{alignItems:'center',flexDirection:'row'},input.customStyle]} testID="up-number-box">{props.showMinus?(input.minusNode?slotButton('minus',minusDisabled,input.minusNode):button('minus',minusDisabled)):null}{input.inputNode??<TextInput editable={!props.disabled&&!props.disabledInput} keyboardType="decimal-pad" onBlur={()=>input.onBlur?.(inner,props.name)} onChangeText={(text)=>{const value=Number(text);if(Number.isFinite(value))update(value)}} onFocus={()=>input.onFocus?.({value:inner,name:props.name})} style={{backgroundColor:props.inputBgColor||props.bgColor||'#ffffff',color:props.color||'#303133',height:getPx(props.buttonSize),padding:0,textAlign:'center',width:getPx(props.inputWidth)}} testID="up-number-box-input" value={String(inner)}/>}{props.showPlus?(input.plusNode?slotButton('plus',plusDisabled,input.plusNode):button('plus',plusDisabled)):null}</View>}
